import { Injectable } from "@nestjs/common";
import InvoicesRepository from "../invoices.repository";
import { InvoiceStatus } from "../Types/invoice.status.type";
import Invoice from "src/EntityModels/invoice";
import { ExpenseStatus } from "../../Expenses/Types/expense.status.type";

@Injectable()
export default class UpdateStatusInvoice {
    constructor(
        private readonly repository: InvoicesRepository
    ) { }

    async update(invoiceId: number, paymentDate: string|null) {
        try {
            const invoice = await this.repository.getById(invoiceId);
            
            if (invoice) {
                const payments = await this.repository.getPayments(invoiceId);
                const totalPayments = payments.reduce((acc, p) => acc + p.value, 0);
                if (totalPayments <= 0 && payments.length > 0) {
                    invoice.status = Invoice.STATUS_REVERSED;
                } else {
                    const invoiceValue = await this.repository.getTotalInvoiceValue(invoiceId);
                    const status = this.defineStatus(totalPayments, invoiceValue);
                    invoice.status = status;
                    invoice.paymentDate = paymentDate;
                }
                await this.repository.save(invoice);
                return await this.repository.updateStatusExpenseByIdInvoice(invoice.id, this.defineStatusExpenses(invoice.status));
            } else {
                throw new Error("Invoice not found");
            }
        } catch (error) {
            throw new Error(`An error ocurred while update invoice: ${error.message}`);
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

    private defineStatusExpenses(statusInvoice: InvoiceStatus) {
        switch (statusInvoice) {
            case Invoice.STATUS_PAID:
                return ExpenseStatus.PAID;
            case Invoice.STATUS_PARCIAL:
                return ExpenseStatus.PARTIAL;
            case Invoice.STATUS_PENDING:
                return ExpenseStatus.PENDING;
            case Invoice.STATUS_REVERSED:
                return ExpenseStatus.REVERSED;
            default:
                return ExpenseStatus.PENDING;
        }
    }
}