import { Injectable, Logger } from '@nestjs/common';
import { CreateChargeDto } from './dtos/create-charge.dto';
import { ChargesRepository } from './charges.repository';
import { ChargesException } from './exceptions/ChargesException';
import { ChargeNotFoundException } from './exceptions/ChargeNotFoundException';
import { InvalidChargeTransitionException } from './exceptions/InvalidChargeTransitionException';
import { ChargesEngine } from './charges.engine';
import { Charge } from 'src/EntityModels/Charge';
import { ChargeGatewayService } from './charge-gateway.service';
import { IGatewayOperationResult } from 'src/Shared/interfaces/IGatewayOperationResult';
import { ChargesFactory } from './factorys/charges.factory';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';
import { ChargeEventsService } from './events/charge-events.service';
import { ChargesEventsEnum } from 'src/enum/charges-events.enum';
import { FinancialEventsEnum } from 'src/enum/financial-events.enum';
import { PaymentType } from 'src/modules/Finance/Payment/Types/payment.type';
import { IChargeInput } from 'src/Shared/interfaces/IChargeInput';
import { FinancialEventsService } from 'src/modules/Finance/core/financial-events/financial-events.service';
import { ChargeStatus } from 'src/enum/charge-status.enum';
import { ChargeEntityType } from 'src/enum/charge-entity-type.enum';
import { RevenueStatus } from 'src/modules/Finance/Revenues/Types/revenue.status.type';
import DateHelper from 'src/Shared/Utils/DateHelper';
import { IWebhookParseResult } from 'src/Shared/interfaces/IWebhookParseResult';

const VALID_TRANSITIONS: Record<ChargeStatus, ChargeStatus[]> = {
    [ChargeStatus.DRAFT]: [ChargeStatus.PROCESSING, ChargeStatus.CANCELED],
    [ChargeStatus.PROCESSING]: [ChargeStatus.AWAITING_PAYMENT, ChargeStatus.PAID, ChargeStatus.FAILED, ChargeStatus.CANCELED],
    [ChargeStatus.AWAITING_PAYMENT]: [ChargeStatus.PAID, ChargeStatus.EXPIRED, ChargeStatus.CANCELED],
    [ChargeStatus.PAID]: [],
    [ChargeStatus.FAILED]: [],
    [ChargeStatus.CANCELED]: [],
    [ChargeStatus.EXPIRED]: [],
};

@Injectable()
export class ChargesService {
    private readonly logger = new Logger(ChargesService.name);

    constructor(
        private readonly repository: ChargesRepository,
        private readonly engine: ChargesEngine,
        private readonly chargeGatewayService: ChargeGatewayService,
        private readonly factory: ChargesFactory,
        private readonly database: MySQLDatabase,
        private readonly events: ChargeEventsService,
        private readonly financialEvents: FinancialEventsService
    ) {}

    async create(dto: CreateChargeDto) {
        try {
            return this.database.transaction(async () => {
                const input = await this.factory.loadEntity(dto.type, dto.entityId);
                if (!input) {
                    throw new ChargesException(`Entity of type ${dto.type} with ID ${dto.entityId} not found`);
                }

                const charge: Charge = await this.engine.process(input);

                const result = await this.repository.save(charge, true);
                charge.id = result.insertId;

                await this.events.logEvent(charge, ChargesEventsEnum.CHARGE_GENERATED);
                await this.registerChargeGeneratedEvent(input, charge);

                if (charge.gatewayId > 0) {
                    const gatewayResult = await this.chargeGatewayService.sendCharge(charge);
                    await this.syncGatewayResponse(charge, gatewayResult);
                    await this.events.logEvent(charge, ChargesEventsEnum.CHARGE_SENDED_TO_GATEWAY)
                }

                return charge;
            })

        } catch (error: any) {
            throw new ChargesException(`Error creating charge: ${error.message}`);
        }
    }

    async markAsPaid(chargeId: number, paidAt?: string): Promise<Charge> {
        return this.database.transaction(async () => {
            const charge = await this.loadAndValidate(chargeId, ChargeStatus.PAID);
            const paymentDate = paidAt ?? DateHelper.getCurrentDate();

            await this.repository.updateStatus(chargeId, ChargeStatus.PAID, paymentDate);
            charge.status = ChargeStatus.PAID;
            charge.paymentAt = paymentDate;

            await this.events.logEvent(charge, ChargesEventsEnum.CHARGE_PAID);
            await this.registerChargeFinancialEvent(charge, FinancialEventsEnum.CHARGE_PAID);
            await this.syncRevenueStatus(charge, RevenueStatus.PAID, paymentDate);

            return charge;
        });
    }

    async markAsProcessing(chargeId: number): Promise<Charge> {
        return this.database.transaction(async () => {
            const charge = await this.loadAndValidate(chargeId, ChargeStatus.PROCESSING);
            
            await this.repository.updateStatus(chargeId, ChargeStatus.PROCESSING);
            charge.status = ChargeStatus.PROCESSING;

            await this.events.logEvent(charge, ChargesEventsEnum.CHARGE_PROCESSING);
            await this.registerChargeFinancialEvent(charge, FinancialEventsEnum.CHARGE_PROCESSING);
            await this.syncRevenueStatus(charge, RevenueStatus.PENDING, null);

            return charge;
        })
    }

    async markAsAwaitingPayment(chargeId: number): Promise<Charge> {
        return this.database.transaction(async () => {
            const charge = await this.loadAndValidate(chargeId, ChargeStatus.AWAITING_PAYMENT);

            await this.repository.updateStatus(chargeId, ChargeStatus.AWAITING_PAYMENT);
            charge.status = ChargeStatus.AWAITING_PAYMENT;

            await this.events.logEvent(charge, ChargesEventsEnum.CHARGE_AWAITING_PAYMENT);
            await this.registerChargeFinancialEvent(charge, FinancialEventsEnum.CHARGE_AWAITING_PAYMENT);
            await this.syncRevenueStatus(charge, RevenueStatus.PENDING, null);

            return charge;
        })
    }

    async cancel(chargeId: number): Promise<Charge> {
        return this.database.transaction(async () => {
            const charge = await this.loadAndValidate(chargeId, ChargeStatus.CANCELED);

            await this.repository.updateStatus(chargeId, ChargeStatus.CANCELED);
            charge.status = ChargeStatus.CANCELED;

            await this.events.logEvent(charge, ChargesEventsEnum.CHARGE_CANCELLED);
            await this.registerChargeFinancialEvent(charge, FinancialEventsEnum.CHARGE_CANCELLED);
            await this.syncRevenueStatus(charge, RevenueStatus.PENDING, null);

            return charge;
        });
    }

    async expire(chargeId: number): Promise<Charge> {
        return this.database.transaction(async () => {
            const charge = await this.loadAndValidate(chargeId, ChargeStatus.EXPIRED);

            await this.repository.updateStatus(chargeId, ChargeStatus.EXPIRED);
            charge.status = ChargeStatus.EXPIRED;

            await this.events.logEvent(charge, ChargesEventsEnum.CHARGE_EXPIRED);
            await this.registerChargeFinancialEvent(charge, FinancialEventsEnum.CHARGE_EXPIRED);
            await this.syncRevenueStatus(charge, RevenueStatus.PENDING, null);

            return charge;
        });
    }

    async refund(chargeId: number): Promise<Charge> {
        return this.database.transaction(async () => {
            const charge = await this.repository.findById(chargeId);
            if (!charge) {
                throw new ChargeNotFoundException(chargeId);
            }

            if (charge.status !== ChargeStatus.PAID) {
                throw new InvalidChargeTransitionException(charge.status, ChargeStatus.CANCELED);
            }

            if (charge.gatewayId > 0) {
                await this.chargeGatewayService.refundCharge(charge);
            }

            await this.repository.updateStatus(chargeId, ChargeStatus.CANCELED);
            charge.status = ChargeStatus.CANCELED;

            await this.events.logEvent(charge, ChargesEventsEnum.CHARGE_REFUNDED);
            await this.registerChargeFinancialEvent(charge, FinancialEventsEnum.CHARGE_REFUNDED);
            await this.syncRevenueStatus(charge, RevenueStatus.PENDING, null);

            return charge;
        });
    }

    async markAsFailed(chargeId: number): Promise<Charge> {
        return this.database.transaction(async () => {
            const charge = await this.loadAndValidate(chargeId, ChargeStatus.FAILED);

            await this.repository.updateStatus(chargeId, ChargeStatus.FAILED);
            charge.status = ChargeStatus.FAILED;

            await this.events.logEvent(charge, ChargesEventsEnum.CHARGE_FAILED);

            return charge;
        });
    }

    async findById(chargeId: number): Promise<Charge> {
        const charge = await this.repository.findById(chargeId);
        if (!charge) throw new ChargeNotFoundException(chargeId);
        return charge;
    }

    async getCharges() {
        return await this.repository.loadAll();
    }

    async getHistory(chargeId: number) {
        return await this.events.loadHistory(chargeId);
    }

    private async loadAndValidate(chargeId: number, target: ChargeStatus): Promise<Charge> {
        const charge = await this.repository.findById(chargeId);
        if (!charge) throw new ChargeNotFoundException(chargeId);

        const allowed = VALID_TRANSITIONS[charge.status] ?? [];
        if (!allowed.includes(target)) {
            throw new InvalidChargeTransitionException(charge.status, target);
        }

        return charge;
    }

    private async resolveAccountId(charge: Charge): Promise<number> {
        if (charge.entityType !== ChargeEntityType.REVENUE) {
            return 0;
        }
        const revenue = await this.repository.loadRevenue(charge.entityId, false);
        return revenue?.idBankAccount ?? 0;
    }

    private async registerChargeFinancialEvent(charge: Charge, type: FinancialEventsEnum): Promise<void> {
        const accountId = await this.resolveAccountId(charge);
        if (!accountId || accountId <= 0) return;

        await this.financialEvents.register({
            accountId,
            type,
            amount: charge.amount,
            referenceType: PaymentType.CHARGE,
            referenceId: charge.id,
        });
    }

    private async syncRevenueStatus(charge: Charge, status: RevenueStatus, paymentDate: string | null): Promise<void> {
        if (charge.entityType !== ChargeEntityType.REVENUE) {
            return;
        }
        await this.repository.updateRevenueStatus(charge.entityId, status, paymentDate);
    }

    private async registerChargeGeneratedEvent(input: IChargeInput, charge: Charge): Promise<void> {
        if (!input.accountId || input.accountId <= 0) {
            return;
        }
        await this.financialEvents.register({
            accountId: input.accountId,
            type: FinancialEventsEnum.CHARGE_GENERATED,
            amount: charge.amount,
            referenceType: PaymentType.CHARGE,
            referenceId: charge.id,
        });
    }

    private async syncGatewayResponse(charge: Charge, gatewayResult: IGatewayOperationResult) {
        charge.status = gatewayResult.status;
        charge.externalId = gatewayResult.externalId ?? charge.externalId;
        charge.paymentLink = gatewayResult.paymentLink ?? charge.paymentLink;
        charge.qrcode = gatewayResult.qrcode ?? charge.qrcode;
        charge.paymentAt = gatewayResult.paidAt ?? charge.paymentAt;
        await this.repository.save(charge, true);
    }

    async findByExternalId(externalId: string): Promise<Charge | undefined> {
        return await this.repository.findByExternalId(externalId);
    }

    async resolveStatus(status: ChargeStatus, parsed: IWebhookParseResult, charge: Charge): Promise<void> {
        switch (status) {
            case ChargeStatus.PAID:
                await this.markAsPaid(charge.id, parsed.paidAt);
                break;
            case ChargeStatus.FAILED:
                await this.markAsFailed(charge.id);
                break;
            case ChargeStatus.CANCELED:
                await this.cancel(charge.id);
                break;
            default:
                this.logger.log(`Webhook: unhandled status ${parsed.newStatus} for charge ${charge.id}`);
        }
    }
}
