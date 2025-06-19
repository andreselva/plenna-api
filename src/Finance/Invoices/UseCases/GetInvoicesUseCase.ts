import { Injectable, Logger } from "@nestjs/common";
import InvoiceRowDTO from "../DTOs/invoice.row.dto";
import Invoice from "../Entity/invoice";
import InvoicesRepository from "../invoices.repository";
import DateHelper from "src/Shared/Utils/DateHelper";
import PeriodoDTO from "src/DTOs/PeriodoDTO";

@Injectable()
export default class GetInvoicesUseCase {
    private readonly logger = new Logger(GetInvoicesUseCase.name)

    constructor(
        private readonly repository: InvoicesRepository
    ) { }

    async get(periodo: PeriodoDTO): Promise<Invoice[]> {
        try {
            const invoices = await this.repository.getInvoices(periodo);
            if (invoices && invoices.length > 0) {
                for (const invoice of invoices) {
                    const expenses = await this.repository.getRelatedExpenses(invoice.getId() ?? 0);
                    if (expenses && expenses.length > 0) {
                        const totalValue = expenses.reduce((acc, expense) => acc + expense.getValue(), 0);
                        invoice.setExpenses(expenses);
                        invoice.setValue(totalValue);
                    } else {
                        invoice.setExpenses([]);
                        invoice.setValue(0);
                    }
                }
                return invoices;
            }

            return [];
        } catch (err) {
            this.logger.error("Erro capturado ao buscar as faturas! Erro: " + err);
            throw new Error("Erro: " + err);
        }
    }

    async getRelatedInvoiceBankAccount(idBankAccount: number) {
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
}