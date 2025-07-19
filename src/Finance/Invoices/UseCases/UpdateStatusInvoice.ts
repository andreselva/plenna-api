import InvoicesRepository from "../invoices.repository";

export default class UpdateStatusInvoice {
    constructor(
        private readonly repository: InvoicesRepository
    ) {}

    async update(invoiceId: number) {
        const payments = await this.repository.getPayments(invoiceId);

        if (payments && Object.keys(payments).length > 0) {
            const totalPaid = payments.reduce((acc, payment) => acc + payment.getValue(), 0);
            const invoice = await this.repository.getById(invoiceId);

            if (invoice) {
                invoice.setStatus(totalPaid >= invoice.getTotal() ? 'paid' : 'pending');
                return await this.repository.save(invoice);
            } else {
                throw new Error("Invoice not found");
            }
        }
    }
}