import { Dependencies, Injectable } from "@nestjs/common";
import { GetExpenses } from "./UseCases/GetExpenses";
import { ExpenseDTO } from "./DTOs/ExpenseDTO";
import { CreateExpense } from "./UseCases/CreateExpense";

@Injectable()
@Dependencies(GetExpenses, CreateExpense)
export class ExpensesServices {
    constructor(
        private readonly getExpensesUseCase: GetExpenses,
        private readonly createExpenseUseCase: CreateExpense,
    ) {}

    async getExpenses() {
        return await this.getExpensesUseCase.execute();
    }

    async createExpense(dto: ExpenseDTO) {
        return await this.createExpenseUseCase.execute(dto);
    }
}