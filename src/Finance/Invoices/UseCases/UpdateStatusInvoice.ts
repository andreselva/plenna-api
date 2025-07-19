import { Injectable } from "@nestjs/common";
import Invoice from "../Entity/invoice";
import InvoicesRepository from "../invoices.repository";

@Injectable()
export default class UpdateStatusInvoice {
    constructor(
        private readonly repository: InvoicesRepository
    ) {}

    async update(invoiceId: number, invoiceValue: number) {
        const payments = await this.repository.getPayments(invoiceId);

        if (payments && Object.keys(payments).length > 0) {
            const totalPaid = payments.reduce((acc, payment) => acc + payment.getValue(), 0);
            const invoice = await this.repository.getById(invoiceId);

            if (invoice) {
                invoice.setStatus(totalPaid >= invoiceValue ? Invoice.STATUS_PAID : Invoice.STATUS_PARCIAL);
                return await this.repository.update(invoice);
            } else {
                throw new Error("Invoice not found");
            }
        }
    }
}