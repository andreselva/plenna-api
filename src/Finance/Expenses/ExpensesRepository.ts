import { Injectable } from "@nestjs/common";
import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import { ExpenseRowDTO } from "./DTOs/ExpenseRowDTO";
import { Expense } from "./Entity/Expense";
import { ExpenseResponseDTO } from "./DTOs/ExpenseResponseDTO";

@Injectable()
export class ExpensesRepository {
    constructor(
        private readonly database: MySQLDatabase,
    ) { }

    async getExpenses(): Promise<ExpenseResponseDTO[]> {
        const query = "SELECT * FROM expense";
        const rows = await this.database.select(query) as ExpenseRowDTO[];

        return rows.map(row => new ExpenseResponseDTO(
            row.id,
            row.name,
            row.description,
            row.value,
            row.invoiceDueDate,
            row.idCategory,
            row.idCreditCard,
            row.typeOfInstallments,
            row.sourceAccountId,
            row.hasInstallments,
            row.installments,
        ));
    }

    async createExpense(expense: Expense): Promise<Expense> {
        const query = "INSERT INTO expense (name, description, value, invoiceDueDate, idCategory, idCreditCard, installments, typeOfInstallments, sourceAccountId, hasInstallments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
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
                expense.getHasInstallments()
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
                message: 'Expense deleted successfully',
            };
        }
        throw new Error('Failed to delete expense');
    }

    async updateExpense(expense: Expense): Promise<ExpenseResponseDTO> {
        if (!expense.getId()) {
            throw new Error('Expense ID is required for update');
        }

        const query = "UPDATE expense SET name = ?, description = ?, value = ?, invoiceDueDate = ?, idCategory = ?, idCreditCard = ? WHERE id = ?";
        const result = await this.database.execute(
            query,
            [
                expense.getName(),
                expense.getDescription(),
                expense.getValue(),
                expense.getInvoiceDueDate(),
                expense.getIdCategory(),
                expense.getIdCreditCard(),
                expense.getId()
            ]
        );

        if (result.affectedRows > 0) {
            return new ExpenseResponseDTO(
                expense.getId(),
                expense.getName(),
                expense.getDescription(),
                expense.getValue(),
                expense.getInvoiceDueDate(),
                expense.getIdCategory(),
                expense.getIdCreditCard(),
                expense.getTypeOfInstallments(),
                expense.getSourceAccountId(),
                expense.getHasInstallments(),
                expense.getInstallments()
            );
        }
        throw new Error('Failed to update category');
    }

    async searchForRelatedInstallments(idInstallment: number): Promise<Expense[]> {
        const query = "SELECT * FROM expense WHERE (sourceAccountId = ? OR id = ?) ORDER BY id ASC";
        const rows = await this.database.select(query, [idInstallment, idInstallment]) as ExpenseRowDTO[];

        return rows.map(row => new Expense(
            String(row.name),
            String(row.description),
            Number(row.value),
            String(row.invoiceDueDate),
            Number(row.idCategory),
            Number(row.idCreditCard),
            Number(row.installments),
            String(row.typeOfInstallments),
            Number(row.sourceAccountId),
            Boolean(row.hasInstallments),
            Number(row.id)
        ))
    }
}