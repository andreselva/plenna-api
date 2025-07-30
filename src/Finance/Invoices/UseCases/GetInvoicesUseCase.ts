import { Injectable, Logger } from "@nestjs/common";
import InvoiceRowDTO from "../DTOs/invoice.row.dto";
import Invoice from "../Entity/invoice";
import InvoicesRepository from "../invoices.repository";
import DateHelper from "src/Shared/Utils/DateHelper";
import PeriodoDTO from "src/DTOs/PeriodoDTO";

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
        try {
            const invoices = await this.repository.getInvoices(periodo);
            if (invoices && invoices.length > 0) {
                return {invoices: await this.setExpensesAndPayments(invoices)};
            }
            return {invoices: []};
        } catch (err) {
            this.logger.error("Erro capturado ao buscar as faturas! Erro: " + err);
            throw new Error("Erro: " + err);
        }
    }

    async getRelatedInvoiceBankAccount(idBankAccount: number): Promise<InvoicesResponse> {
        const invoicesRelated = await this.repository.getRelatedInvoiceBankAccount(idBankAccount) as InvoiceRowDTO[];

        const invoicesList = invoicesRelated ?? [];
        const mappedInvoices = invoicesList.map(invoice => {
            const closingDate = DateHelper.toISODate(invoice.closingDate) as string;
            const dueDate = DateHelper.toISODate(invoice.dueDate) as string;
            const name = `${invoice.name} - ${DateHelper.toMonthYear(closingDate)} - Vencimento: ${DateHelper.toBrazilianDate(dueDate)}`;

            return new Invoice(
                closingDate,
                dueDate,
                invoice.idBankAccount,
                name,
                invoice.id,
                invoice.status,
                invoice.paymentDate
            );
        });

        return { invoices: mappedInvoices };
    }

    private async setExpensesAndPayments(invoices: Invoice[]): Promise<Invoice[]> {
        try {
            for (const invoice of invoices) {
                const expenses = await this.repository.getRelatedExpenses(invoice.getId());
                const totalPaiments = await this.repository.getPayments(invoice.getId());
    
                if (expenses && expenses.length > 0) {
                    const totalValue = expenses.reduce((acc, expense) => acc + expense.getValue(), 0);
                    invoice.setExpenses(expenses);
                    invoice.setValue(totalValue);
                } else {
                    invoice.setExpenses([]);
                    invoice.setValue(0);
                }
    
                if (totalPaiments > 0) {
                    invoice.setTotalPaid(totalPaiments);
                } else {
                    invoice.setTotalPaid(0);
                }
            }
            return invoices;
        } catch (err) {
            this.logger.error("Erro ao buscar despesas e pagamentos relacionados às faturas! Erro: " + err);
            throw new Error("Erro: " + err);
        }
    }
}