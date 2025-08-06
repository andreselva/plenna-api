import { Injectable } from "@nestjs/common";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import { ExpenseDTO } from "./DTOs/ExpenseDTO";
import { ExpenseStatus } from "./Types/expense.status.type";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import { Expense } from "src/EntityModels/Expense";

@Injectable()
export class ExpensesRepository extends BaseRepository<Expense>{
    constructor(database: MySQLDatabase) {
        super(database);
    }

    async getExpenses(periodo: PeriodoDTO): Promise<Expense[]> {
        const query = "SELECT * FROM expense WHERE invoiceDueDate >= ? AND invoiceDueDate <= ?";
        const rows = await this.database.select(query, [periodo.start, periodo.end]);
        return this.extractToEntity(rows, Expense);
    }

    async saveExpense(expense: Expense): Promise<Expense> {
        const result = await this.save(expense)
        if (result.affectedRows > 0 && expense.id === 0) {
            expense.id = result.insertId;
            return expense;
        }
        return expense;
    }

    async deleteExpense(id: number) {
        const query = "DELETE FROM expense WHERE id = ?";
        const result = await this.database.execute(query, [id]);

        if (result.affectedRows > 0) {
            return {
                isSuccess: true,
                message: 'Expense deleted successfully',
            };
        }
        throw new Error('Failed to delete expense');
    }

    async searchForRelatedInstallments(consideredId: number, expenseId: number = 0): Promise<Expense[]> {
        let query = "SELECT * FROM expense WHERE (sourceAccountId = ? OR id = ?)";
        const params = [consideredId, consideredId];
        if (expenseId > 0) {
            query += " AND id >= ?";
            params.push(expenseId);
        }
        query += " ORDER BY id ASC";
        const rows = await this.database.select(query, params);
        return this.extractToEntity(rows, Expense);
    }

    async updateStatus(id: number, status: ExpenseStatus, paymentDate: string | null) {
        try {
            const query = "UPDATE expense SET status = ?, paymentDate = ? WHERE id = ?";
            const result = await this.database.execute(query, [status, paymentDate, id]);

            if (result.affectedRows === 0) {
                throw new Error("Failed to update expense status");
            }
        } catch (error) {
            throw new Error(`Failed to update expense status: ${error.message}`);
        }
    }

    async getPayments(id: number): Promise<number> {
        try {
            const query = "SELECT SUM(value) as totalPayments FROM payment WHERE payable_type = 'expense' AND payable_id = ?";
            const result = await this.database.select(query, [id]);
            return Number(result[0]?.totalPayments) || 0;
        } catch (error) {
            throw new Error(`Failed to get payments for expense ID ${id}: ${error.message}`);
        }
    }

    async getExpenseById(id: number) {
        try {
            const query = "SELECT * FROM expense WHERE id = ?";
            const result = await this.database.select(query, [id]) as ExpenseDTO[];
            if (result && result.length > 0) {
                return Expense.fromDTO(result[0]);
            }
            throw new Error("Expense not found");
        } catch (error) {
            throw new Error(`Failed to get expense by ID ${id}: ${error.message}`);
        }
    }
}