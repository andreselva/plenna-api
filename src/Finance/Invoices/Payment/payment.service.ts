import { Injectable } from "@nestjs/common";
import PaymentRegister from "./UseCases/PaymentRegister";
import PaymentInicialDataDTO from "./DTOs/PaymentInicialDataDTO";
import { InvoicesService } from "../invoices.service";

@Injectable()
export default class PaymentService {
    constructor(
        private readonly paymentRegisterUC: PaymentRegister,
        private readonly invoiceService: InvoicesService
    ) { }

    async registerPayment(paymentData: PaymentInicialDataDTO) {
        if (paymentData && Object.keys(paymentData).length > 0) {
            const savedPayment =  await this.paymentRegisterUC.register(paymentData);

            if (savedPayment && savedPayment.getIdInvoice() > 0) {
                await this.invoiceService.updateInvoiceStatus(savedPayment.getIdInvoice(), paymentData.invoice.value);
                return { isSuccess: true, payment: savedPayment };
            }
        } else {
            throw new Error("Invalid payment data");
        }
    }
}