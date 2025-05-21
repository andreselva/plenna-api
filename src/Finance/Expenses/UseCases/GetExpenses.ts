import { Injectable } from "@nestjs/common";
import { ExpensesRepository } from "../ExpensesRepository";
import { FormatDate } from "src/Shared/Utils/FormatDate";
import PeriodoDTO from "src/DTOs/PeriodoDTO";

@Injectable()
export class GetExpenses {
    constructor(
        private readonly repository: ExpensesRepository
    ) {}

    async execute(periodo: PeriodoDTO) {
        const expenses = await this.repository.getExpenses(periodo);
        const formattedExpenses = expenses.map(expense => ({
            ...expense,
            invoiceDueDate: FormatDate.formatToYYYYMMDD(expense.invoiceDueDate)
        }));
        return formattedExpenses;
    }
}