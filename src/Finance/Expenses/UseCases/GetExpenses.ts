import { Injectable } from "@nestjs/common";
import { ExpensesRepository } from "../ExpensesRepository";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import DateHelper from "src/Shared/Utils/DateHelper";

@Injectable()
export class GetExpenses {
    constructor(
        private readonly repository: ExpensesRepository
    ) {}

    async execute(periodo: PeriodoDTO) {
        const expenses = await this.repository.getExpenses(periodo);
        const formattedExpenses = expenses.map(expense => ({
            ...expense,
            invoiceDueDate: DateHelper.toISODate(expense.invoiceDueDate)
        }));
        return formattedExpenses;
    }
}