import { Injectable } from "@nestjs/common";
import { ExpenseDTO } from "../DTOs/ExpenseDTO";
import { Expense } from "../Entity/Expense";
import { ExpensesRepository } from "../ExpensesRepository";
import { FormatDate } from "src/Shared/Utils/FormatDate";

@Injectable()
export class UpdateExpense {
    constructor(
        private readonly repository: ExpensesRepository,
    ) {}

    async execute(id: string, expense: ExpenseDTO) {
        expense.id = Number(id);
        expense.invoiceDueDate = FormatDate.formatToYYYYMMDD(expense.invoiceDueDate);
        const entity = Expense.fromDTO(expense);
        return await this.repository.updateExpense(entity)
    }
}