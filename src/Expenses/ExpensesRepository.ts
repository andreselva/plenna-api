import { Injectable } from "@nestjs/common";
import MySQLDatabase from "src/Database/MySQLDatabase";
import { ExpenseRowDTO } from "./DTOs/ExpenseRowDTO";
import { Expense } from "./Entity/Expense";
import { CreateExpenseResponseDTO } from "./DTOs/CreateExpenseResponseDTO";

@Injectable()
export class ExpensesRepository {
    constructor(
        private readonly database: MySQLDatabase,
    ) { }

    async getExpenses(): Promise<Expense[]> {
        const query = "SELECT * FROM revenue";
        const rows = await this.database.select(query) as ExpenseRowDTO[];

        return rows.map(row => new Expense(
            row.name,
            row.description,
            row.value,
            row.invoiceDueDate,
            row.idCategory,
            row.id,
        ));
    }

    async createExpense(expense: Expense): Promise<CreateExpenseResponseDTO> {
        const query = "INSERT INTO expense (name, description, value, invoiceDueDate, idCategory) VALUES (?, ?, ?, ?, ?)";
        const result = await this.database.execute(
            query,
            [expense.getName(), expense.getDescription(), expense.getValue(), expense.getInvoiceDueDate(), expense.getIdCategory()]
        );

        if (result.affectedRows > 0) {
            return new CreateExpenseResponseDTO(
                result.insertId,
                expense.getName(),
                expense.getDescription(),
                expense.getValue(),
                expense.getInvoiceDueDate(),
                expense.getIdCategory()
            )
        }

        throw new Error("Failed to create expense");
    }
}