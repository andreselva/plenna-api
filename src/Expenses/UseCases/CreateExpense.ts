import { FormatDate } from "src/Shared/Utils/FormatDate";
import { ExpenseDTO } from "../DTOs/ExpenseDTO";
import { ExpensesRepository } from "../ExpensesRepository";
import { Expense } from "../Entity/Expense";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CreateExpense {
    constructor(
        private readonly repository: ExpensesRepository,
    ) { }

    async execute(expense: ExpenseDTO) {
        expense.invoiceDueDate = FormatDate.formatToYYYYMMDD(expense.invoiceDueDate);
        const entity = Expense.fromDTO(expense);
        return await this.repository.createExpense(entity);
    }
}