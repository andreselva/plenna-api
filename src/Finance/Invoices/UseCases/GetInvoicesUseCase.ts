import { Injectable } from "@nestjs/common";
import InvoiceRowDTO from "../DTOs/invoice.row.dto";
import Invoice from "../Entity/invoice";
import InvoicesRepository from "../invoices.repository";
import DateHelper from "src/Shared/Utils/DateHelper";

@Injectable()
export default class GetInvoicesUseCase {
    constructor(
        private readonly repository: InvoicesRepository
    ) { }

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
                invoice.status
            );
        });

        return { invoices: mappedInvoices };
    }
}