import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import Invoice from "./Entity/invoice";
import { Injectable } from "@nestjs/common";
import InvoiceRowDTO from "./DTOs/invoice.row.dto";
import DateHelper from "src/Shared/Utils/DateHelper";
import { Expense } from "../Expenses/Entity/Expense";
import { ExpenseRowDTO } from "../Expenses/DTOs/ExpenseRowDTO";
// import PeriodoDTO from "src/DTOs/PeriodoDTO";

@Injectable()
export default class InvoicesRepository {
    constructor(
        private readonly database: MySQLDatabase
    ) { }

    async getInvoices(): Promise<Invoice[]> {
        try {
            const query = "SELECT * FROM invoices";
            const rows = await this.database.select(query) as InvoiceRowDTO[];
            if (rows && rows.length > 0) {
                return rows.map(row => new Invoice(
                    DateHelper.toISODate(row.closingDate) as string,
                    DateHelper.toISODate(row.dueDate) as string,
                    row.idBankAccount,
                    row.name,
                    row.id,
                    row.status,
                    DateHelper.toISODate(row.paymentDate)
                ))
            }
            return []
        } catch (err) {
            throw new Error("Erro ao buscar as faturas! Erro: " + err);
        }
    }

    async createInvoice(invoice: Invoice) {
        try {
            const query = "INSERT INTO invoices (idBankAccount, name, closingDate, dueDate, status) VALUES (?, ?, ?, ?, ?)";
            const result = await this.database.execute(
                query, [invoice.getIdBankAccount(), invoice.getName(), invoice.getClosingDate(), invoice.getDueDate(), invoice.getStatus()]
            );
            if (result.affectedRows > 0 && result.insertId > 0) {
                invoice.setId(result.insertId);
                return {
                    isSuccess: true, createdInvoice: invoice
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

    async updateExpense(expense: Expense) {
        try {
            await this.database.execute("UPDATE expense SET idInvoice = ? WHERE id = ?", [expense.getIdInvoice(), expense.getId()]);
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
        try {
            if (idInvoice === 0) {
                throw new Error("Erro ao buscar despesas relacionadas à fatura! ID zero recebido: " + idInvoice);
            }
            const query = "SELECT * FROM expense WHERE idInvoice = ?";
            const result = await this.database.select(query, [idInvoice]) as ExpenseRowDTO[];
            if (result && result.length > 0) {
                return result.map(expense => new Expense(
                    expense.name,
                    expense.description,
                    Number(expense.value),
                    DateHelper.toISODate(expense.invoiceDueDate) as string,
                    expense.idCategory,
                    expense.idCreditCard,
                    expense.installments,
                    expense.typeOfInstallments,
                    expense.sourceAccountId,
                    Boolean(expense.hasInstallments),
                    Boolean(expense.linkToInvoice),
                    expense.idInvoice,
                    expense.id
                ))
            }

            return [];
        } catch (err) {
            throw new Error("Ocorreu um erro ao buscar as despesas relacionadas à fatura! Erro: " + err);
        }

    }
}