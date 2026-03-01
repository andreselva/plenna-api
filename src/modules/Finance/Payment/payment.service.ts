import { Injectable } from "@nestjs/common";
import PaymentRegister from "./UseCases/PaymentRegister";
import PaymentInicialDataDTO from "./DTOs/PaymentInicialDataDTO";
import { InvoicesService } from "../Invoices/invoices.service";
import { PaymentType } from "./Types/payment.type";
import { ExpensesServices } from "../Expenses/ExpensesServices";
import GetPayments from "./UseCases/GetPayments";
import ReversePaymentDataDTO from "./DTOs/ReversePaymentDataDTO";
import DeletePayment from "./UseCases/DeletePayment";
import RevenuesService from "../Revenues/RevenuesService";

@Injectable()
export default class PaymentService {
    constructor(
        private readonly paymentRegisterUC: PaymentRegister,
        private readonly invoiceService: InvoicesService,
        private readonly expenseService: ExpensesServices,
        private readonly getPaymentsUC: GetPayments,
        private readonly deletePaymentUC: DeletePayment,
        private readonly revenueService: RevenuesService
    ) { }

    async registerPayment(paymentData: PaymentInicialDataDTO) {
        if (paymentData && Object.keys(paymentData).length > 0) {
            const savedPayment = await this.paymentRegisterUC.register(paymentData);

            if (!savedPayment) {
                throw new Error("Failed to register payment");
            }

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
}