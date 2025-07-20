import { Injectable } from "@nestjs/common";
import PaymentRegister from "./UseCases/PaymentRegister";
import PaymentInicialDataDTO from "./DTOs/PaymentInicialDataDTO";
import { InvoicesService } from "../Invoices/invoices.service";
import { PaymentType } from "./Types/payment.type";
import { ExpensesServices } from "../Expenses/ExpensesServices";

@Injectable()
export default class PaymentService {
    constructor(
        private readonly paymentRegisterUC: PaymentRegister,
        private readonly invoiceService: InvoicesService,
        private readonly expenseService: ExpensesServices
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
}