import { Injectable } from "@nestjs/common";
import PaymentRegister from "./UseCases/PaymentRegister";
import PaymentInicialDataDTO from "./DTOs/PaymentInicialDataDTO";
import { InvoicesService } from "../Invoices/invoices.service";
import { PaymentType } from "./Types/payment.type";
import { ExpensesServices } from "../Expenses/ExpensesServices";
import GetPayments from "./UseCases/GetPayments";
import ReversePaymentDataDTO from "./DTOs/ReversePaymentDataDTO";
import DeletePayment from "./UseCases/DeletePayment";

@Injectable()
export default class PaymentService {
    constructor(
        private readonly paymentRegisterUC: PaymentRegister,
        private readonly invoiceService: InvoicesService,
        private readonly expenseService: ExpensesServices,
        private readonly getPaymentsUC: GetPayments,
        private readonly deletePaymentUC: DeletePayment
    ) { }

    async registerPayment(paymentData: PaymentInicialDataDTO) {
        if (paymentData && Object.keys(paymentData).length > 0) {
            const savedPayment = await this.paymentRegisterUC.register(paymentData);

            if (!savedPayment) {
                throw new Error("Failed to register payment");
            }

            switch (paymentData.payableType) {
                case PaymentType.INVOICE:
                    await this.invoiceService.updateInvoiceStatus(savedPayment.getPayableId(), savedPayment.getPaymentDate());
                    return { isSuccess: true, payment: savedPayment };
                case PaymentType.EXPENSE:
                    await this.expenseService.updateStatusExpense(savedPayment.getPayableId(), savedPayment.getPaymentDate());
                    return { isSuccess: true, payment: savedPayment };
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
        const result = await this.deletePaymentUC.delete(dto);

        if (result) {
            switch (dto.entityType) {
                case PaymentType.INVOICE:
                    await this.invoiceService.updateInvoiceStatus(dto.entityId, '');
                    return { isSuccess: true, message: "Payment reversed successfully" };
                case PaymentType.EXPENSE:
                    await this.expenseService.updateStatusExpense(dto.entityId, '');
                    return { isSuccess: true, message: "Payment reversed successfully" };
                default:
                    throw new Error("Invalid entity type for payment reversal");
            }
        }
    }
}