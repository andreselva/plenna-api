import { Injectable } from "@nestjs/common";
import { ExpensesRepository } from "../ExpensesRepository";
import { FormatDate } from "src/Helpers/DateHelper/FormatDate";

@Injectable()
export class GetExpenses {
    constructor(
        private readonly repository: ExpensesRepository
    ) {}

    async execute() {
        const expenses = await this.repository.getExpenses();
        const formattedExpenses = expenses.map(expense => ({
            ...expense,
            invoiceDueDate: FormatDate.formatDateToDDMMYYYY(expense.invoiceDueDate)
        }));
        return formattedExpenses;
    }
}