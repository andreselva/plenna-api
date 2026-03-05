import { Injectable } from "@nestjs/common";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import { ExpenseStatus } from "./Types/expense.status.type";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import { Expense } from "src/EntityModels/Expense";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import Payment from "src/EntityModels/Payment";
import DataMapper from "src/Shared/mapper/DataMapper";

@Injectable()
export class ExpensesRepository extends BaseRepository<Expense> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext);
    }
    
    async getExpenses(periodo: PeriodoDTO): Promise<Expense[]> {
        const query = "SELECT * FROM expense WHERE clientId = ? AND invoiceDueDate >= ? AND invoiceDueDate <= ?";
        const rows = await this.database.select(query, [this.authContext.getClientId(), periodo.start, periodo.end]);
        return this.extractToEntity(rows, Expense);
    }

    async saveExpense(expense: Expense): Promise<Expense> {
        expense.clientId = this.authContext.getClientId();
        const result = await this.save(expense)
        if (result.affectedRows > 0 && expense.id === 0) {
            expense.id = result.insertId;
        }
        return expense;
    }

    async deleteExpense(id: number) {
        const query = "DELETE FROM expense WHERE clientId = ? AND id = ?";
        const result = await this.database.execute(query, [this.authContext.getClientId(), id]);

        if (result.affectedRows > 0) {
            return {
                isSuccess: true,
                message: 'Expense deleted successfully',
            };
        }
        throw new Error('Failed to delete expense');
    }

    async searchForRelatedInstallments(consideredId: number, expenseId: number = 0): Promise<Expense[]> {
        let query = "SELECT * FROM expense WHERE clientId = ? AND (sourceAccountId = ? OR id = ?)";
        const params = [this.authContext.getClientId(), consideredId, consideredId];
        if (expenseId > 0) {
            query += " AND id >= ?";
            params.push(expenseId);
        }
        query += " ORDER BY id ASC";
        const rows = await this.database.select(query, params);
        return this.extractToEntity(rows, Expense);
    }

    async updateStatus(id: number, status: ExpenseStatus, paymentDate: string | null) {
        const query = "UPDATE expense SET status = ?, paymentDate = ? WHERE id = ? AND clientId = ?";
        const result = await this.database.execute(query, [status, paymentDate, id, this.authContext.getClientId()]);
        if (result.affectedRows === 0) {
            throw new Error("Failed to update expense status");
        }
    }

    async getPayments(id: number): Promise<Payment[]> {
        const query = "SELECT * FROM payment WHERE clientId = ? AND payable_type = 'expense' AND payable_id = ?";
        const result = await this.database.select(query, [this.authContext.getClientId(), id]);
        return DataMapper.toEntities(result, Payment);
    }

    async getExpenseById(id: number) {
        const query = "SELECT * FROM expense WHERE clientId = ? AND id = ?";
        const result = await this.database.select(query, [this.authContext.getClientId(), id]);
        return this.extractToEntity(result, Expense)[0] ?? null;
    }
}