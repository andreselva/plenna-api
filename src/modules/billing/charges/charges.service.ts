import { Injectable } from '@nestjs/common';
import { CreateChargeDto } from './dtos/create-charge.dto';
import { ChargesRepository } from './charges.repository';
import { ChargesException } from './exceptions/ChargesException';
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

@Injectable()
export class ChargesService {
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

    async getCharges() {
        return await this.repository.loadAll();
    }

    async getHistory(chargeId: number) {
        return await this.events.loadHistory(chargeId);
    }
}
