import { Dependencies, Injectable } from "@nestjs/common";
import { GetExpenses } from "./UseCases/GetExpenses";
import { ExpenseDTO } from "./DTOs/ExpenseDTO";
import { CreateExpense } from "./UseCases/CreateExpense";
import { DeleteExpense } from "./UseCases/DeleteExpense";
import { UpdateExpense } from "./UseCases/UpdateExpense";

@Injectable()
@Dependencies(GetExpenses, CreateExpense, DeleteExpense, UpdateExpense)
export class ExpensesServices {
    constructor(
        private readonly getExpensesUseCase: GetExpenses,
        private readonly createExpenseUseCase: CreateExpense,
        private readonly deleteExpenseUseCase: DeleteExpense,
        private readonly updateExpenseUseCase: UpdateExpense,
    ) { }

    async getExpenses() {
        return await this.getExpensesUseCase.execute();
    }

    async createExpense(dto: ExpenseDTO) {
        return await this.createExpenseUseCase.execute(dto);
    }

    async deleteExpense(id: string) {
        return await this.deleteExpenseUseCase.execute(id);
    }

    async updateExpense(id: string, expense: ExpenseDTO) {
        return await this.updateExpenseUseCase.execute(id, expense);
    }
}