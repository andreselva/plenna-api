import { Dependencies, Injectable } from "@nestjs/common";
import { GetExpenses } from "./UseCases/GetExpenses";
import { ExpenseDTO } from "./DTOs/ExpenseDTO";
import { CreateExpense } from "./UseCases/CreateExpense";
import { DeleteExpense } from "./UseCases/DeleteExpense";
import { UpdateExpense } from "./UseCases/UpdateExpense";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import { ExpenseStatus } from "./Types/expense.status.type";

@Injectable()
@Dependencies(GetExpenses, CreateExpense, DeleteExpense, UpdateExpense)
export class ExpensesServices {
    constructor(
        private readonly getExpensesUseCase: GetExpenses,
        private readonly createExpenseUseCase: CreateExpense,
        private readonly deleteExpenseUseCase: DeleteExpense,
        private readonly updateExpenseUseCase: UpdateExpense,
    ) { }

    async getExpenses(periodo: PeriodoDTO) {
        return await this.getExpensesUseCase.execute(periodo);
    }

    async createExpense(dto: ExpenseDTO, periodo: PeriodoDTO) {
        try {
            if ((dto.typeOfInstallment === 'P' && dto.installments && dto.installments > 0) || dto.typeOfInstallment === 'F') {
                dto.hasInstallments = true;
            }

            return await this.createExpenseUseCase.execute(dto, periodo);
        } catch (error) {
            throw new Error("Error creating expense: " + error.message);
        }
    }

    async deleteExpense(id: string, deleteInstallments: string, sourceAccountId: string, periodo: PeriodoDTO) {
        const deleteAnotherInstallments = deleteInstallments === 'false' ? false : true;
        return await this.deleteExpenseUseCase.execute(Number(id), deleteAnotherInstallments, Number(sourceAccountId), periodo);
    }

    async updateExpense(id: string, expense: ExpenseDTO, periodo: PeriodoDTO) {
        return await this.updateExpenseUseCase.execute(id, expense, periodo);
    }

    async updateStatusExpense(id: number, paymentDate: string) {
        const status = ExpenseStatus.PAID;
        try {
            await this.updateExpenseUseCase.updateExpenseStatus(id, status, paymentDate);
        } catch (error) {
            throw new Error(`Failed to update expense status: ${error.message}`);
        }
    }
}