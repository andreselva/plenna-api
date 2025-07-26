import { Injectable } from "@nestjs/common";
import Invoice from "../Entity/invoice";
import InvoicesRepository from "../invoices.repository";
import { InvoiceStatus } from "../Types/invoice.status.type";

@Injectable()
export default class UpdateStatusInvoice {
    constructor(
        private readonly repository: InvoicesRepository
    ) { }

    async update(invoiceId: number, paymentDate: string) {
        const totalPayments = await this.repository.getPayments(invoiceId);

        if (totalPayments > 0) {
            const invoice = await this.repository.getById(invoiceId);
            const invoiceValue = await this.repository.getTotalInvoiceValue(invoiceId);

            if (invoice) {
                const status = this.defineStatus(totalPayments, invoiceValue);
                invoice.setStatus(status);
                invoice.setPaymentDate(paymentDate);
                return await this.repository.update(invoice);
            } else {
                throw new Error("Invoice not found");
            }
        }
    }

    private defineStatus(totalPayments: number, invoiceValue: number): InvoiceStatus {
        if (totalPayments >= invoiceValue) {
            return Invoice.STATUS_PAID;
        } else if (totalPayments > 0) {
            return Invoice.STATUS_PARCIAL;
        } else {
            return Invoice.STATUS_PENDING;
        }
    }
}