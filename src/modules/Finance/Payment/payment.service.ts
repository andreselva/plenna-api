import { Injectable, Logger } from "@nestjs/common";
import PaymentInicialDataDTO from "./DTOs/PaymentInicialDataDTO";
import { InvoicesService } from "../Invoices/invoices.service";
import { PaymentType } from "./Types/payment.type";
import { ExpensesServices } from "../Expenses/ExpensesServices";
import RevenuesService from "../Revenues/RevenuesService";
import { FinancialEventsService, IFinancialEvent } from "src/modules/financial-events/financial-events.service";
import { FinancialEventsEnum } from "src/enum/financial-events.enum";
import ReversePaymentDataDTO from "./DTOs/ReversePaymentDataDTO";
import DateHelper from "src/Shared/Utils/DateHelper";
import Payment from "src/EntityModels/Payment";
import { PaymentRepository } from "./payment.repository";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";

@Injectable()
export default class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        private readonly invoiceService: InvoicesService,
        private readonly expenseService: ExpensesServices,
        private readonly revenueService: RevenuesService,
        private readonly financialEventsService: FinancialEventsService,
        private readonly repository: PaymentRepository,
        private readonly database: MySQLDatabase
    ) { }

    private async register(payment: PaymentInicialDataDTO) {
        const entity = Payment.fromDTO(payment);
        return await this.repository.savePayment(entity);
    }

    async registerPayment(paymentData: PaymentInicialDataDTO) {
        try {
            if (paymentData && Object.keys(paymentData).length > 0) {
                return this.database.transaction(async () => {
                    const savedPayment = await this.register(paymentData);
        
                    if (!savedPayment) {
                        throw new Error("Failed to register payment");
                    }
        
                    await this.financialEventsService.register({
                        accountId: paymentData.accountId,
                        amount: paymentData.value,
                        type: FinancialEventsEnum.PAYMENT_POSTED,
                        referenceId: paymentData.payableId,
                        referenceType: paymentData.payableType
                    } satisfies IFinancialEvent)
        
                    await this.updateStatus(paymentData.payableType, savedPayment.payable_id, savedPayment.payment_date);
                })
            } else {
                throw new Error("Invalid payment data");
            }
        } catch (error) {
            this.logger.error(error.message);
        }
    }

    async getPaymentsData(entityType: PaymentType, entityId: string) {
        if (entityType && entityId) {
            const payments = await this.repository.getPaymentsByEntity(entityType, entityId);

            if (!payments || payments.length === 0) {
                return { "payments": [] };
            }

            return { payments: payments };
        }
        throw new Error("Entity type and ID are required");
    }

    async deletePayment(dto: ReversePaymentDataDTO) {
        const payment = await this.repository.verifyReversePayment(dto.paymentId);
        if (payment.reversed !== null) {
            throw new Error(`Já existe um estorno para esse pagamento.`);
        }

        const paymentDTO = new PaymentInicialDataDTO();
        paymentDTO.payableId = dto.entityId;
        paymentDTO.payableType = dto.referenceType;
        paymentDTO.paymentDate = DateHelper.getCurrentDate();
        paymentDTO.value = -Math.abs(dto.amount);

        const savedReversed = await this.register(paymentDTO);

        if (savedReversed !== null) {
            await this.financialEventsService.register({
                accountId: dto.accountId,
                amount: paymentDTO.value,
                type: FinancialEventsEnum.REVERSAL,
                referenceId: dto.entityId,
                referenceType: dto.referenceType
            })
        }

        //Se o tipo de pagamento for invoice, é necessário buscar as despesas para registrar os eventos.
        await this.repository.updateReverseDate(dto.paymentId, DateHelper.getCurrentDate());
        return await this.updateStatus(paymentDTO.payableType, dto.entityId, null);
    }

    private async updateStatus(type: PaymentType, id: number, paymentDate: string | null) {
        try {
            switch(type) {
                case PaymentType.INVOICE:
                    return this.invoiceService.updateInvoiceStatus(id, paymentDate);
                case PaymentType.EXPENSE:
                    return await this.expenseService.updateStatusExpense(id, paymentDate);
                case PaymentType.REVENUE:
                    return this.revenueService.updateStatusRevenue(id, paymentDate);
                default:
                    throw new Error(`Nenhum método de atualização de status encontrado para ${type}`);
            }
        } catch (error) {
            this.logger.error(`Erro retornado na atualização de status: ${error.message}`);
        }
    }
}