import { Injectable, Logger } from "@nestjs/common";
import InvoiceRowDTO from "../DTOs/invoice.row.dto";
import InvoicesRepository from "../invoices.repository";
import DateHelper from "src/Shared/Utils/DateHelper";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import Invoice from "src/EntityModels/invoice";

export interface InvoicesResponse {
    invoices: Invoice[];
}

@Injectable()
export default class GetInvoicesUseCase {
    private readonly logger = new Logger(GetInvoicesUseCase.name)

    constructor(
        private readonly repository: InvoicesRepository
    ) { }

    async get(periodo: PeriodoDTO): Promise<InvoicesResponse> {
        const invoices = await this.repository.getInvoices(periodo);
        if (invoices && invoices.length > 0) {
            return {invoices: (await this.setExpensesAndPayments(invoices)).filter(invoice => invoice.value > 0)};
        }
        return {invoices: []};
    }

    async getRelatedInvoiceBankAccount(idBankAccount: number): Promise<InvoicesResponse> {
        const invoicesRelated = await this.repository.getRelatedInvoiceBankAccount(idBankAccount) as InvoiceRowDTO[];

        const invoicesList = invoicesRelated ?? [];
        const mappedInvoices = invoicesList.map(invoice => {
            const closingDate = DateHelper.toISODate(invoice.closingDate) as string;
            const dueDate = DateHelper.toISODate(invoice.dueDate) as string;
            const name = `${invoice.name} - ${DateHelper.toMonthYear(closingDate)} - Vencimento: ${DateHelper.toBrazilianDate(dueDate)}`;
            
            const newInvoice = new Invoice();
            newInvoice.closingDate = closingDate
            newInvoice.dueDate = dueDate;
            newInvoice.idBankAccount = invoice.idBankAccount;
            newInvoice.name = name;
            newInvoice.id = invoice.id;
            newInvoice.status = invoice.status
            newInvoice.paymentDate = invoice.paymentDate
            return newInvoice;
        });

        return { invoices: mappedInvoices };
    }

    private async setExpensesAndPayments(invoices: Invoice[]): Promise<Invoice[]> {
        try {
            for (const invoice of invoices) {
                const expenses = await this.repository.getRelatedExpenses(invoice.id);
                const payments = await this.repository.getPayments(invoice.id);
                const totalPayments = payments.reduce((acc, p) => acc + p.value, 0);
    
                if (expenses && expenses.length > 0) {
                    const totalValue = expenses.reduce((acc, expense) => Number(acc) + Number(expense.value), 0);
                    invoice.expenses = expenses;
                    invoice.value = totalValue;
                } else {
                    invoice.expenses = [];
                    invoice.value = 0;
                }
    
                if (totalPayments > 0) {
                    invoice.totalPaid = totalPayments;
                } else {
                    invoice.totalPaid = 0;
                }
            }
            return invoices;
        } catch (err) {
            this.logger.error("Erro ao buscar despesas e pagamentos relacionados às faturas! Erro: " + err);
            throw new Error("Erro: " + err);
        }
    }
}