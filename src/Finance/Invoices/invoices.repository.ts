import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import Invoice from "./Entity/invoice";
import { Injectable } from "@nestjs/common";
import InvoiceRowDTO from "./DTOs/invoice.row.dto";
import DateHelper from "src/Shared/Utils/DateHelper";

@Injectable()
export default class InvoicesRepository {
    constructor(
        private readonly database: MySQLDatabase
    ) { }

    async createInvoice(invoice: Invoice) {
        try {
            const query = "INSERT INTO invoices (idBankAccount, name, closingDate, dueDate, status) VALUES (?, ?, ?, ?, ?)";
            const result = await this.database.execute(
                query, [invoice.getIdBankAccount(), invoice.getName(), invoice.getClosingDate(), invoice.getDueDate(), invoice.getStatus()]
            );
            if (result.affectedRows > 0) {
                return {
                    isSuccess: true
                }
            }
            if (result.affectedRows <= 0) {
                throw new Error('A fatura não foi criada!');
            }
        } catch (err) {
            throw new Error(`Erro ao criar fatura: ${err}`);
        }
    }

    async searchInvoice(idBankAccount: number) {
        try {
            const query = "SELECT * FROM invoices WHERE idBankAccount = ? ORDER BY id DESC LIMIT 1";
            const result = await this.database.select(query, [idBankAccount]) as InvoiceRowDTO[];

            if (result && result.length > 0) {
                const invoice = result[0];
                return new Invoice(
                    DateHelper.toISODate(invoice.closingDate) as string,
                    DateHelper.toISODate(invoice.dueDate) as string,
                    invoice.idBankAccount,
                    invoice.name,
                    invoice.id
                );
            }

            return null;
        } catch (err) {
            throw new Error(`Erro ao buscar fatura: ${err}`);
        }
    }

    async getRelatedInvoiceBankAccount(idBankAccount: number) {
        const query = "SELECT * FROM invoices WHERE idBankAccount = ? AND status = 'pending'";
        const result = await this.database.select(query, [idBankAccount]);
        if (result && result.length > 0) {
            return result;
        }
        return null;
    }
}