import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import Invoice from "../../EntityModels/invoice";
import { Injectable } from "@nestjs/common";
import InvoiceRowDTO from "./DTOs/invoice.row.dto";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import { PaymentType } from "../Payment/Types/payment.type";
import QueryBuilder from "src/Shared/QueryBuilder/QueryBuilder";
import { Expense } from "src/EntityModels/Expense";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import DataMapper from "src/Shared/mapper/DataMapper";

@Injectable()
export default class InvoicesRepository extends BaseRepository<Invoice>{
    constructor(database: MySQLDatabase) {
        super(database);
    }

    async getInvoices(periodo: PeriodoDTO): Promise<Invoice[]> {
        const query = "SELECT * FROM invoices WHERE dueDate >= ? AND dueDate <= ?";
        const rows = await this.database.select(query, [periodo.start, periodo.end]);
        return this.extractToEntity(rows, Invoice);
    }

    async createInvoice(invoice: Invoice) {
        const result = await this.save(invoice);
        if (result.affectedRows > 0 && invoice.id === 0) {
            invoice.id = result.insertId;
        }
        return invoice;
    }

    async searchInvoice(idBankAccount: number) {
        const query = "SELECT * FROM invoices WHERE idBankAccount = ? ORDER BY id DESC LIMIT 1";
        const result = await this.database.select(query, [idBankAccount]);
        return this.extractToEntity(result, Invoice)[0] ?? [];
    }

    async getRelatedInvoiceBankAccount(idBankAccount: number) {
        const query = "SELECT * FROM invoices WHERE idBankAccount = ?";
        const result = await this.database.select(query, [idBankAccount]);
        if (result && result.length > 0) {
            return result;
        }
        return null;
    }

    async updateExpense(expense: Expense) {
        try {
            const { sql, values } = QueryBuilder.buildQuery(expense, expense.getTableName(), expense.getPrimaryKey(), expense.getIgnoredProperties())
            await this.database.execute(sql, values);
        } catch (err) {
            throw new Error("Erro ao atualizar despesa na fatura! Erro: " + err);
        }
    }

    async getSettingsInvoice(idBankAccount: number) {
        const query = "SELECT closingDate, dueDate, id as idAccount, name as nameAccount FROM bank_account WHERE id = ? LIMIT 1";
        const result = await this.database.select(query, [idBankAccount]);
        return result[0];
    }

    async getRelatedExpenses(idInvoice: number): Promise<Expense[]> {
        const query = "SELECT * FROM expense WHERE idInvoice = ?";
        const result = await this.database.select(query, [idInvoice]);
        return DataMapper.toEntities(result, Expense);
    }

    async getPayments(idInvoice: number): Promise<number> {
        const query = "SELECT SUM(value) as value FROM payment WHERE payable_id = ? AND payable_type = ?";
        const result = await this.database.select(query, [idInvoice, PaymentType.INVOICE]);
        return Number(result[0]?.value) || 0;
    }

    async getById(id: number): Promise<Invoice> {
        const query = "SELECT * FROM invoices WHERE id = ?";
        const result = await this.database.select(query, [id]) as InvoiceRowDTO[];
        return this.extractToEntity(result, Invoice)[0] ?? [];
    }

    async getTotalInvoiceValue(idInvoice: number): Promise<number> {
        const query = "SELECT SUM(value) as total FROM expense WHERE idInvoice = ?";
        const result = await this.database.select(query, [idInvoice]);
        return Number(result[0]?.total) || 0;
    }
}