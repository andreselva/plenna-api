import { Injectable } from "@nestjs/common";
import { ExpensesRepository } from "../ExpensesRepository";
import PeriodoDTO from "src/DTOs/PeriodoDTO";

@Injectable()
export class GetExpenses {
    constructor(
        private readonly repository: ExpensesRepository
    ) { }

    async execute(periodo: PeriodoDTO) {
        const expenses = await this.repository.getExpenses(periodo);
        const promiseArray = expenses.map(async (expense) => {
            const totalPayments = await this.repository.getPayments(expense.getId());
            expense.setTotalPaid(totalPayments);
            return expense;
        })
        const formattedExpenses = await Promise.all(promiseArray);
        return formattedExpenses;
    }
}