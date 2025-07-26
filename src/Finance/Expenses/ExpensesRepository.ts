import { Injectable } from "@nestjs/common";
import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import { ExpenseRowDTO } from "./DTOs/ExpenseRowDTO";
import { Expense } from "./Entity/Expense";
import { ExpenseResponseDTO } from "./DTOs/ExpenseResponseDTO";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import { ExpenseDTO } from "./DTOs/ExpenseDTO";
import { ExpenseStatus } from "./Types/expense.status.type";

@Injectable()
export class ExpensesRepository {
    constructor(
        private readonly database: MySQLDatabase,
    ) { }

    async getExpenses(periodo: PeriodoDTO): Promise<ExpenseResponseDTO[]> {
        const query = "SELECT * FROM expense WHERE invoiceDueDate >= ? AND invoiceDueDate <= ?";
        const rows = await this.database.select(query, [periodo.start, periodo.end]) as ExpenseRowDTO[];
        return rows.map(row => new ExpenseResponseDTO(
            Number(row.id),
            String(row.name),
            String(row.description),
            Number(row.value),
            row.invoiceDueDate,
            Number(row.idCategory),
            Number(row.idCreditCard),
            String(row.typeOfInstallment),
            Number(row.sourceAccountId),
            Boolean(row.hasInstallments),
            Number(row.installments),
            Boolean(row.linkToInvoice),
            Number(row.idInvoice),
            row.status,
        ));
    }

    async createExpense(expense: Expense): Promise<Expense> {
        const query = "INSERT INTO expense (name, description, value, invoiceDueDate, idCategory, idCreditCard, installments, typeOfInstallment, sourceAccountId, hasInstallments, linkToInvoice, idInvoice, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const result = await this.database.execute(
            query,
            [
                expense.getName(),
                expense.getDescription(),
                expense.getValue(),
                expense.getInvoiceDueDate(),
                expense.getIdCategory(),
                expense.getIdCreditCard(),
                expense.getInstallments(),
                expense.getTypeOfInstallments(),
                expense.getSourceAccountId(),
                expense.getHasInstallments(),
                expense.getLinkToInvoice(),
                expense.getIdInvoice(),
                expense.getStatus()
            ]
        );

        if (result.affectedRows > 0) {
            expense.setId(result.insertId);
            return expense;
        }

        throw new Error("Failed to create expense");
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

    async updateExpense(expense: Expense): Promise<ExpenseResponseDTO> {
        if (!expense.getId()) {
            throw new Error('Expense ID is required for update');
        }

        const query = "UPDATE expense SET name = ?, description = ?, value = ?, invoiceDueDate = ?, idCategory = ?, idCreditCard = ?, linkToInvoice = ?, idInvoice = ?, status = ? WHERE id = ?";
        const result = await this.database.execute(query, [expense.getName(), expense.getDescription(), expense.getValue(), expense.getInvoiceDueDate(), expense.getIdCategory(), expense.getIdCreditCard(), expense.getLinkToInvoice(), expense.getIdInvoice(), expense.getStatus(), expense.getId()]
        );

        if (result.affectedRows > 0) {
            return new ExpenseResponseDTO(expense.getId(), expense.getName(), expense.getDescription(), expense.getValue(), expense.getInvoiceDueDate(), expense.getIdCategory(), expense.getIdCreditCard(), expense.getTypeOfInstallments(), expense.getSourceAccountId(), expense.getHasInstallments(), expense.getInstallments(), expense.getLinkToInvoice(), expense.getIdInvoice(), expense.getStatus());
        }
        throw new Error('Failed to update category');
    }

    async searchForRelatedInstallments(consideredId: number, expenseId: number = 0): Promise<Expense[]> {
        let query = "SELECT * FROM expense WHERE (sourceAccountId = ? OR id = ?)";
        const params = [consideredId, consideredId];
        if (expenseId > 0) {
            query += " AND id >= ?";
            params.push(expenseId);
        }
        query += " ORDER BY id ASC";
        const rows = await this.database.select(query, params) as ExpenseDTO[];
        return rows.map(row => new Expense(row))
    }

    async updateStatus(id: number, status: ExpenseStatus, paymentDate: string|null) {
        try {
            if (paymentDate === '') {
                paymentDate = null;
            }
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
            return result[0]?.totalPayments || 0;
        } catch (error) {
            throw new Error(`Failed to get payments for expense ID ${id}: ${error.message}`);
        }
    }

    async getExpenseById(id: number) {
        try {
            const query = "SELECT * FROM expense WHERE id = ?";
            const result = await this.database.select(query, [id]) as ExpenseDTO[];
            if (result && result.length > 0) {
                return new Expense(result[0]);
            }
            throw new Error("Expense not found");
        } catch (error) {
            throw new Error(`Failed to get expense by ID ${id}: ${error.message}`);
        }
    }
}