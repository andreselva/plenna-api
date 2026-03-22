import { Injectable } from "@nestjs/common";
import PaymentInicialDataDTO from "./DTOs/PaymentInicialDataDTO";
import { InvoicesService } from "../Invoices/invoices.service";
import { PaymentType } from "./Types/payment.type";
import { ExpensesServices } from "../Expenses/ExpensesServices";
import RevenuesService from "../Revenues/RevenuesService";
import { FinancialEventsEnum } from "src/enum/financial-events.enum";
import ReversePaymentDataDTO from "./DTOs/ReversePaymentDataDTO";
import DateHelper from "src/Shared/Utils/DateHelper";
import Payment from "src/EntityModels/Payment";
import { PaymentRepository } from "./payment.repository";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import { FinancialEventsService, IFinancialEvent } from "../core/financial-events/financial-events.service";
import { LedgerEngine } from "../core/ledger/ledger.engine";
import { HelperFunctions } from "src/Shared/Utils/HelperFunctions";

@Injectable()
export default class PaymentService {
    constructor(
        private readonly invoiceService: InvoicesService,
        private readonly expenseService: ExpensesServices,
        private readonly revenueService: RevenuesService,
        private readonly financialEventsService: FinancialEventsService,
        private readonly ledgerEngine: LedgerEngine,
        private readonly repository: PaymentRepository,
        private readonly database: MySQLDatabase
    ) {}

    private async register(payment: PaymentInicialDataDTO) {
        const entity = Payment.fromDTO(payment);
        return await this.repository.savePayment(entity);
    }
    async registerPayment(dto: PaymentInicialDataDTO) {
        if (!dto || Object.keys(dto).length === 0) {
            throw new Error("Invalid payment data");
        }

        const normalizedDate = DateHelper.toISODate(dto.paymentDate) ?? dto.paymentDate;
        
        return this.database.transaction(async () => {
            const payment = await this.repository.savePayment(
                Payment.fromDTO({ ...dto, paymentDate: normalizedDate, value: dto.value })
            );
            
            const normalizedAmount = this.normalizeAmount(dto.value, dto.payableType);
            const event = await this.createEvent({
                accountId: dto.accountId,
                amount: normalizedAmount,
                type: this.resolveEventType(dto.payableType),
                referenceId: dto.payableId,
                referenceType: dto.payableType
            });

            await this.ledgerEngine.process(event);

            return this.updateStatus(dto.payableType, payment.payable_id, payment.payment_date);
        });
    }

    async deletePayment(dto: ReversePaymentDataDTO) {
        const original = await this.repository.verifyReversePayment(dto.paymentId);

        if (!HelperFunctions.isNullable(original.reversed, true, true)) {
            throw new Error("Já existe um estorno para esse pagamento.");
        }

        return this.database.transaction(async () => {
            const paymentDTO = new PaymentInicialDataDTO();
            paymentDTO.payableId = dto.entityId;
            paymentDTO.payableType = dto.referenceType;
            paymentDTO.paymentDate = DateHelper.getCurrentISODate();
            paymentDTO.value = dto.amount < 0 ? dto.amount : -Math.abs(dto.amount);
            paymentDTO.accountId = dto.accountId;
            
            await this.register(paymentDTO);
            
            const amount = this.normalizeReversalAmount(dto.amount, dto.referenceType);
            const event = await this.createEvent({
                accountId: dto.accountId,
                amount,
                type: FinancialEventsEnum.REVERSAL,
                referenceId: dto.entityId,
                referenceType: dto.referenceType
            });

            await this.ledgerEngine.process(event);
            await this.repository.updateReverseDate(dto.paymentId, DateHelper.getCurrentDate());
            return this.updateStatus(dto.referenceType, dto.entityId, null);
        });
    }

    async getPaymentsData(entityType: PaymentType, entityId: string) {
        if (!entityType || !entityId) {
            throw new Error("Entity type and ID are required");
        }

        const payments = await this.repository.getPaymentsByEntity(entityType, entityId);
        return { payments: payments ?? [] };
    }

    private async createEvent(data: IFinancialEvent) {
        return this.financialEventsService.register(data);
    }

    private normalizeAmount(value: number, type: PaymentType): number {
        if ([PaymentType.EXPENSE, PaymentType.INVOICE].includes(type)) {
            return -Math.abs(value);
        }
        return Math.abs(value);
    }

    private normalizeReversalAmount(value: number, type: PaymentType): number {
        if ([PaymentType.EXPENSE, PaymentType.INVOICE].includes(type)) {
            return Math.abs(value);
        }
        return -Math.abs(value);
    }

    private resolveEventType(type: PaymentType): FinancialEventsEnum {
        return type === PaymentType.REVENUE ? FinancialEventsEnum.REVENUE_RECEIVED : FinancialEventsEnum.PAYMENT_POSTED;
    }

    private async updateStatus(type: PaymentType, id: number, paymentDate: string | null) {
        switch (type) {
            case PaymentType.INVOICE:
                return this.invoiceService.updateInvoiceStatus(id, paymentDate);
            case PaymentType.EXPENSE:
                return this.expenseService.updateStatusExpense(id, paymentDate);
            case PaymentType.REVENUE:
                return this.revenueService.updateStatusRevenue(id, paymentDate);
            default:
                throw new Error("Invalid payment type");
        }
    }
}