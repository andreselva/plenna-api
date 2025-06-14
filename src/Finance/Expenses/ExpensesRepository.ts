import { Injectable } from "@nestjs/common";
import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import { ExpenseRowDTO } from "./DTOs/ExpenseRowDTO";
import { Expense } from "./Entity/Expense";
import { ExpenseResponseDTO } from "./DTOs/ExpenseResponseDTO";
import { FormatDate } from "src/Shared/Utils/FormatDate";
import PeriodoDTO from "src/DTOs/PeriodoDTO";

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
            String(row.typeOfInstallments),
            Number(row.sourceAccountId),
            Boolean(row.hasInstallments),
            Number(row.installments),
            Boolean(row.linkToInvoice),
            Number(row.idInvoice)
        ));
    }

    async createExpense(expense: Expense): Promise<Expense> {
        const query = "INSERT INTO expense (name, description, value, invoiceDueDate, idCategory, idCreditCard, installments, typeOfInstallments, sourceAccountId, hasInstallments, linkToInvoice, idInvoice) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
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
                expense.getIdInvoice()
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

        const query = "UPDATE expense SET name = ?, description = ?, value = ?, invoiceDueDate = ?, idCategory = ?, idCreditCard = ?, linkToInvoice = ?, idInvoice = ? WHERE id = ?";
        const result = await this.database.execute(
            query,
            [
                expense.getName(),
                expense.getDescription(),
                expense.getValue(),
                expense.getInvoiceDueDate(),
                expense.getIdCategory(),
                expense.getIdCreditCard(),
                expense.getLinkToInvoice(),
                expense.getIdInvoice(),
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
                expense.getInstallments(),
                expense.getLinkToInvoice(),
                expense.getIdInvoice()
            );
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

        const rows = await this.database.select(query, params) as ExpenseRowDTO[];

        return rows.map(row => new Expense(
            String(row.name),
            String(row.description),
            Number(row.value),
            FormatDate.formatToYYYYMMDD(row.invoiceDueDate),
            Number(row.idCategory),
            Number(row.idCreditCard),
            Number(row.installments),
            String(row.typeOfInstallments),
            Number(row.sourceAccountId),
            Boolean(row.hasInstallments),
            Boolean(row.linkToInvoice),
            Number(row.idInvoice),
            Number(row.id)
        ))
    }
}