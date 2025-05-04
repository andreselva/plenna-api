import { Injectable } from "@nestjs/common";
import { ExpenseDTO } from "../DTOs/ExpenseDTO";
import { Expense } from "../Entity/Expense";
import { ExpensesRepository } from "../ExpensesRepository";

@Injectable()
export class UpdateExpense {
    constructor(
        private readonly repository: ExpensesRepository,
    ) {}

    async execute(id: string, expense: ExpenseDTO) {
        expense.id = Number(id);
        if (expense.idCreditCard === undefined || !expense.idCreditCard) {
            expense.idCreditCard = 0;
        }
        const entity = Expense.fromDTO(expense);
        return await this.repository.updateExpense(entity)
    }
}