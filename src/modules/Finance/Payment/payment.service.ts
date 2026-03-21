import { Injectable } from "@nestjs/common";
import PaymentInicialDataDTO from "./DTOs/PaymentInicialDataDTO";
import { InvoicesService } from "../Invoices/invoices.service";
import { PaymentType } from "./Types/payment.type";
import { ExpensesServices } from "../Expenses/ExpensesServices";
import RevenuesService from "../Revenues/RevenuesService";
import { FinancialEventsService, IFinancialEvent } from "src/modules/Finance/financial-events/financial-events.service";
import { FinancialEventsEnum } from "src/enum/financial-events.enum";
import ReversePaymentDataDTO from "./DTOs/ReversePaymentDataDTO";
import DateHelper from "src/Shared/Utils/DateHelper";
import Payment from "src/EntityModels/Payment";
import { PaymentRepository } from "./payment.repository";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";

@Injectable()
export default class PaymentService {
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
        if (!paymentData || Object.keys(paymentData).length === 0) {
            throw new Error("Invalid payment data");
        }

        paymentData.paymentDate = DateHelper.toISODate(paymentData.paymentDate) ?? paymentData.paymentDate;

        return this.database.transaction(async () => {   
            const savedPayment = await this.register(paymentData);
            if (!savedPayment) {
                throw new Error("Failed to register payment");
            }
            
            if ([PaymentType.EXPENSE, PaymentType.INVOICE].includes(paymentData.payableType)) {
                paymentData.value = -Math.abs(paymentData.value);
            }

            await this.financialEventsService.register({
                accountId: paymentData.accountId,
                amount: paymentData.value,
                type: paymentData.payableType === PaymentType.REVENUE ? FinancialEventsEnum.REVENUE_RECEIVED : FinancialEventsEnum.PAYMENT_POSTED,
                referenceId: paymentData.payableId,
                referenceType: paymentData.payableType
            } satisfies IFinancialEvent);

            await this.updateStatus(
                paymentData.payableType, 
                savedPayment.payable_id, 
                savedPayment.payment_date
            );
        });
    }

    async getPaymentsData(entityType: PaymentType, entityId: string) {
        if (!entityType || !entityId) {
            throw new Error("Entity type and ID are required");
        }

        const payments = await this.repository.getPaymentsByEntity(entityType, entityId);
        if (!payments || payments.length === 0) {
            return { payments: [] };
        }

        return { payments: payments };
    }

    async deletePayment(dto: ReversePaymentDataDTO) {
        const payment = await this.repository.verifyReversePayment(dto.paymentId);
        if (payment.reversed !== null) {
            throw new Error(`Já existe um estorno para esse pagamento.`);
        }

        return this.database.transaction(async () => {
            const paymentDTO = new PaymentInicialDataDTO();
            paymentDTO.payableId = dto.entityId;
            paymentDTO.payableType = dto.referenceType;
            paymentDTO.paymentDate = DateHelper.getCurrentISODate();

            // O estorno fica salvo negativo na tabela de pagamentos sempre.
            paymentDTO.value = -Math.abs(dto.amount);
            paymentDTO.accountId = dto.accountId;

            const savedReversed = await this.register(paymentDTO);

            if (savedReversed !== null) {
                /**
                 * Para o registro dos eventos, o estorno deve condizer com o tipo do pagamento.
                 * 
                 * Para casos onde o dinheiro sai, como despesas e faturas, o estorno deve ser positivo, pois está voltando ao caixa.
                 * Para casos onde o dinheiro entra, como receitas, o estorno deve ser negativo, pois está saindo do caixa.
                 */
                if ([PaymentType.EXPENSE, PaymentType.INVOICE].includes(dto.referenceType)) {
                    dto.amount = +Math.abs(dto.amount);
                } else if (dto.referenceType === PaymentType.REVENUE) {
                    dto.amount = -Math.abs(dto.amount);
                }

                await this.financialEventsService.register({
                    accountId: dto.accountId,
                    amount: dto.amount,
                    type: FinancialEventsEnum.REVERSAL,
                    referenceId: dto.entityId,
                    referenceType: dto.referenceType
                } satisfies IFinancialEvent);

                await this.repository.updateReverseDate(dto.paymentId, DateHelper.getCurrentDate());
                return await this.updateStatus(dto.referenceType, dto.entityId, null);
            }
        });
    }

    private async updateStatus(type: PaymentType, id: number, paymentDate: string | null) {
        switch (type) {
            case PaymentType.INVOICE:
                return this.invoiceService.updateInvoiceStatus(id, paymentDate);
            case PaymentType.EXPENSE:
                return await this.expenseService.updateStatusExpense(id, paymentDate);
            case PaymentType.REVENUE:
                return this.revenueService.updateStatusRevenue(id, paymentDate);
            default:
                throw new Error("Invalid payment type");
        }
    }
}