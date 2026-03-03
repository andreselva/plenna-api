import { Injectable } from "@nestjs/common";
import PaymentRegister from "./UseCases/PaymentRegister";
import PaymentInicialDataDTO from "./DTOs/PaymentInicialDataDTO";
import { InvoicesService } from "../Invoices/invoices.service";
import { PaymentType } from "./Types/payment.type";
import { ExpensesServices } from "../Expenses/ExpensesServices";
import GetPayments from "./UseCases/GetPayments";
import DeletePayment from "./UseCases/DeletePayment";
import RevenuesService from "../Revenues/RevenuesService";
import { FinancialEventsService, IFinancialEvent } from "src/modules/financial-events/financial-events.service";
import { FinancialEventsEnum } from "src/enum/financial-events.enum";
import ReversePaymentDataDTO from "./DTOs/ReversePaymentDataDTO";

@Injectable()
export default class PaymentService {
    constructor(
        private readonly paymentRegisterUC: PaymentRegister,
        private readonly invoiceService: InvoicesService,
        private readonly expenseService: ExpensesServices,
        private readonly getPaymentsUC: GetPayments,
        private readonly deletePaymentUC: DeletePayment,
        private readonly revenueService: RevenuesService,
        private readonly financialEventsService: FinancialEventsService
    ) { }

    async registerPayment(paymentData: PaymentInicialDataDTO) {
        if (paymentData && Object.keys(paymentData).length > 0) {
            const savedPayment = await this.paymentRegisterUC.register(paymentData);

            if (!savedPayment) {
                throw new Error("Failed to register payment");
            }

            await this.financialEventsService.register({
                accountId: 0, // LEMBRAR DE ALTERAR DEPOIS
                amount: paymentData.value,
                type: FinancialEventsEnum.PAYMENT_POSTED,
                referenceId: paymentData.payableId,
                referenceType: paymentData.payableType
            } satisfies IFinancialEvent)

            switch (paymentData.payableType) {
                case PaymentType.INVOICE:
                    await this.invoiceService.updateInvoiceStatus(savedPayment.payable_id, savedPayment.payment_date);
                    return { payment: savedPayment };
                case PaymentType.EXPENSE:
                    await this.expenseService.updateStatusExpense(savedPayment.payable_id, savedPayment.payment_date);
                    return { payment: savedPayment };
                case PaymentType.REVENUE:
                    await this.revenueService.updateStatusRevenue(savedPayment.payable_id, savedPayment.payment_date);
                    return { payment: savedPayment };
            }
        } else {
            throw new Error("Invalid payment data");
        }
    }

    async getPaymentsData(entityType: PaymentType, entityId: string) {
        if (entityType && entityId) {
            switch (entityType) {
                case PaymentType.INVOICE:
                    return await this.getPaymentsUC.execute(entityType, entityId);
                case PaymentType.EXPENSE:
                    return await this.getPaymentsUC.execute(entityType, entityId);
                default:
                    throw new Error("Invalid entity type");
            }
        } else {
            throw new Error("Entity type and ID are required");
        }
    }

    async deletePayment(dto: ReversePaymentDataDTO) {
        try {
            const result = await this.deletePaymentUC.delete(dto);

            if (result) {
                switch (dto.entityType) {
                    case PaymentType.INVOICE:
                        await this.invoiceService.updateInvoiceStatus(dto.entityId, null);
                        return { isSuccess: true, message: "Payment reversed successfully" };
                    case PaymentType.EXPENSE:
                        return this.expenseService.updateStatusExpense(dto.entityId, '');
                    default:
                        throw new Error("Invalid entity type for payment reversal");
                }
            }
        } catch (error) {
            throw new Error(`An error ocurred while delete payment: ${error.message}`);
        }
    }
}