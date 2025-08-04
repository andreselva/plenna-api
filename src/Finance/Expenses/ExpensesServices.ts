import { Dependencies, Injectable } from "@nestjs/common";
import { GetExpenses } from "./UseCases/GetExpenses";
import { ExpenseDTO } from "./DTOs/ExpenseDTO";
import { CreateExpense } from "./UseCases/CreateExpense";
import { DeleteExpense } from "./UseCases/DeleteExpense";
import { UpdateExpense } from "./UseCases/UpdateExpense";
import PeriodoDTO from "src/DTOs/PeriodoDTO";

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
        if ((dto.typeOfInstallment === 'P' && dto.installments && dto.installments > 0) || dto.typeOfInstallment === 'F') {
            dto.hasInstallments = true;
        }

        return await this.createExpenseUseCase.execute(dto, periodo);
    }

    async deleteExpense(id: string, deleteInstallments: string, sourceAccountId: string, periodo: PeriodoDTO) {
        const deleteAnotherInstallments = deleteInstallments === 'false' ? false : true;
        return await this.deleteExpenseUseCase.execute(Number(id), deleteAnotherInstallments, Number(sourceAccountId), periodo);
    }

    async updateExpense(id: string, expense: ExpenseDTO, periodo: PeriodoDTO) {
        return await this.updateExpenseUseCase.execute(id, expense, periodo);
    }

    async updateStatusExpense(id: number, paymentDate: string|null) {
        if (paymentDate === '') {
            paymentDate = null;
        }
        return await this.updateExpenseUseCase.updateExpenseStatus(id, paymentDate);
    }
}