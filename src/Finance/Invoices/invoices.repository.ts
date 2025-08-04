import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import Invoice from "./Entity/invoice";
import { Injectable } from "@nestjs/common";
import InvoiceRowDTO from "./DTOs/invoice.row.dto";
import DateHelper from "src/Shared/Utils/DateHelper";
import { Expense } from "../Expenses/Entity/Expense";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import { ExpenseDTO } from "../Expenses/DTOs/ExpenseDTO";
import { PaymentType } from "../Payment/Types/payment.type";

@Injectable()
export default class InvoicesRepository {
    constructor(
        private readonly database: MySQLDatabase
    ) { }

    async getInvoices(periodo: PeriodoDTO): Promise<Invoice[]> {
        try {
            const query = "SELECT * FROM invoices WHERE dueDate >= ? AND dueDate <= ?";
            const rows = await this.database.select(query, [periodo.start, periodo.end]) as InvoiceRowDTO[];
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
        const query = "SELECT * FROM invoices WHERE idBankAccount = ?";
        const result = await this.database.select(query, [idBankAccount]);
        if (result && result.length > 0) {
            return result;
        }
        return null;
    }

    async updateExpense(expense: Expense) {
        try {
            await this.database.execute("UPDATE expense SET idInvoice = ?, invoiceDueDate = ? WHERE id = ?", [expense.getIdInvoice(), expense.getInvoiceDueDate(), expense.getId()]);
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
            const result = await this.database.select(query, [idInvoice]) as ExpenseDTO[];
            if (result && result.length > 0) {
                return result.map(expense =>
                    new Expense(expense)
                )
            };

            return [];
        } catch (err) {
            throw new Error("Ocorreu um erro ao buscar as despesas relacionadas à fatura! Erro: " + err);
        }
    }

    async getPayments(idInvoice: number): Promise<number> {
        try {
            const query = "SELECT SUM(value) as value FROM payment WHERE payable_id = ? AND payable_type = ?";
            const result = await this.database.select(query, [idInvoice, PaymentType.INVOICE]);
            return Number(result[0]?.value) || 0;
        } catch (err) {
            throw new Error("Erro ao buscar pagamentos relacionados à fatura! Erro: " + err);
        }
    }

    async getById(id: number): Promise<Invoice> {
        try {
            const query = "SELECT * FROM invoices WHERE id = ?";
            const result = await this.database.select(query, [id]) as InvoiceRowDTO[];
            if (result && result.length > 0) {
                const row = result[0];
                return new Invoice(
                    DateHelper.toISODate(row.closingDate) as string,
                    DateHelper.toISODate(row.dueDate) as string,
                    row.idBankAccount,
                    row.name,
                    row.id,
                    row.status,
                    DateHelper.toISODate(row.paymentDate)
                );
            }
            throw new Error("Invoice not found");
        } catch (err) {
            throw new Error("Erro ao buscar fatura por ID! Erro: " + err);
        }
    }

    async update(invoice: Invoice): Promise<Invoice> {
        try {
            const query = "UPDATE invoices SET idBankAccount = ?, name = ?, closingDate = ?, dueDate = ?, status = ?, paymentDate = ? WHERE id = ?";
            const result = await this.database.execute(query, [
                invoice.getIdBankAccount(),
                invoice.getName(),
                invoice.getClosingDate(),
                invoice.getDueDate(),
                invoice.getStatus(),
                invoice.getPaymentDate(),
                invoice.getId()
            ]);
            if (result.affectedRows > 0) {
                return invoice;
            } else {
                throw new Error("Fatura não encontrada ou não atualizada.");
            }
        } catch (err) {
            throw new Error("Erro ao atualizar fatura! Erro: " + err);
        }
    }

    async getTotalInvoiceValue(idInvoice: number): Promise<number> {
        try {
            const query = "SELECT SUM(value) as total FROM expense WHERE idInvoice = ?";
            const result = await this.database.select(query, [idInvoice]);
            return Number(result[0]?.total) || 0;
        } catch (err) {
            throw new Error("Erro ao buscar total da fatura! Erro: " + err);
        }
    }
}