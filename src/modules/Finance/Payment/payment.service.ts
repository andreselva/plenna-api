import { Injectable, Logger } from "@nestjs/common";
import PaymentInicialDataDTO from "./DTOs/PaymentInicialDataDTO";
import { InvoicesService } from "../Invoices/invoices.service";
import { PaymentType } from "./Types/payment.type";
import { ExpensesServices } from "../Expenses/ExpensesServices";
import GetPayments from "./UseCases/GetPayments";
import RevenuesService from "../Revenues/RevenuesService";
import { FinancialEventsService, IFinancialEvent } from "src/modules/financial-events/financial-events.service";
import { FinancialEventsEnum } from "src/enum/financial-events.enum";
import ReversePaymentDataDTO from "./DTOs/ReversePaymentDataDTO";
import DateHelper from "src/Shared/Utils/DateHelper";
import Payment from "src/EntityModels/Payment";
import { PaymentRepository } from "./payment.repository";

@Injectable()
export default class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

    constructor(
        private readonly invoiceService: InvoicesService,
        private readonly expenseService: ExpensesServices,
        private readonly getPaymentsUC: GetPayments,
        private readonly revenueService: RevenuesService,
        private readonly financialEventsService: FinancialEventsService,
        private readonly repository: PaymentRepository
    ) { }

    private async register(payment: PaymentInicialDataDTO) {
        const entity = Payment.fromDTO(payment);
        return await this.repository.savePayment(entity);
    }

    async registerPayment(paymentData: PaymentInicialDataDTO) {
        try {
            if (paymentData && Object.keys(paymentData).length > 0) {
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
            } else {
                throw new Error("Invalid payment data");
            }
        } catch (error) {
            this.logger.error(error.message);
        }
    }

    async getPaymentsData(entityType: PaymentType, entityId: string) {
        try {
            return await this.getPaymentsUC.execute(entityType, entityId);
        } catch (error) {
            this.logger.error(error.message);
        }
    }

    async deletePayment(dto: ReversePaymentDataDTO) {
        try {
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
            await this.updateStatus(paymentDTO.payableType, dto.entityId, null);
            await this.repository.updateReverseDate(dto.paymentId, DateHelper.getCurrentDate());
            this.logger.log(`[ESTORNO_PAGAMENTO]: PaymentId ${dto.paymentId} | Value: ${paymentDTO.value}`);
        } catch (error) {
            throw new Error(`An error ocurred while delete payment: ${error.message}`);
        }
    }

    private async updateStatus(type: PaymentType, id: number, paymentDate: string | null) {
        try {
            switch(type) {
                case PaymentType.INVOICE:
                    await this.invoiceService.updateInvoiceStatus(id, paymentDate);
                    break;
                case PaymentType.EXPENSE:
                    await this.expenseService.updateStatusExpense(id, paymentDate);
                    break;
                case PaymentType.REVENUE:
                    await this.revenueService.updateStatusRevenue(id, paymentDate);
                    break;
                default:
                    throw new Error(`Nenhum método de atualização de status encontrado para ${type}`);
            }
        } catch (error) {
            this.logger.error(`Erro retornado na atualização de status: ${error.message}`);
        }
    }
}