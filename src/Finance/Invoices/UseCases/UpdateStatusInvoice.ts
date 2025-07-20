import { Injectable } from "@nestjs/common";
import Invoice from "../Entity/invoice";
import InvoicesRepository from "../invoices.repository";

@Injectable()
export default class UpdateStatusInvoice {
    constructor(
        private readonly repository: InvoicesRepository
    ) {}

    async update(invoiceId: number, paymentDate: string) {
        const totalPayments = await this.repository.getPayments(invoiceId);

        if (totalPayments > 0) {
            const invoice = await this.repository.getById(invoiceId);
            const invoiceValue = await this.repository.getTotalInvoiceValue(invoiceId);

            if (invoice) {
                invoice.setStatus(totalPayments >= invoiceValue ? Invoice.STATUS_PAID : Invoice.STATUS_PARCIAL);
                invoice.setPaymentDate(paymentDate);
                return await this.repository.update(invoice);
            } else {
                throw new Error("Invoice not found");
            }
        }
    }
}