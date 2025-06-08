import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import Invoice from "./Entity/invoice";
import { Injectable } from "@nestjs/common";

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
}