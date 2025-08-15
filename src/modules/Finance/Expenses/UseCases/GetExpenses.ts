import { Injectable } from "@nestjs/common";
import { ExpensesRepository } from "../ExpensesRepository";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import { Expense } from "src/EntityModels/Expense";

@Injectable()
export class GetExpenses {
    constructor(
        private readonly repository: ExpensesRepository
    ) { }

    async execute(periodo: PeriodoDTO): Promise<{ expenses: Expense[] }> {
        const expenses = await this.repository.getExpenses(periodo);
        const promiseArray = expenses.map(async (expense) => {
            const totalPayments = await this.repository.getPayments(expense.id);
            expense.totalPaid = totalPayments;
            return expense;
        })
        const formattedExpenses = await Promise.all(promiseArray);
        return { expenses: formattedExpenses };
    }
}