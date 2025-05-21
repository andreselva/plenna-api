import { HttpStatus, Injectable } from "@nestjs/common";
import { ExpensesRepository } from "../ExpensesRepository";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import { GetExpenses } from "./GetExpenses";

@Injectable()
export class DeleteExpense {
    constructor(
        private readonly repository: ExpensesRepository,
        private readonly getExpensesUseCase: GetExpenses,
    ) { }

    async execute(id: number, deleteInstallments: boolean, sourceAccountId: number, periodo: PeriodoDTO) {
        if (deleteInstallments && sourceAccountId >= 0) {
            const queryId = sourceAccountId > 0 ? sourceAccountId : id;
            const installments = await this.repository.searchForRelatedInstallments(queryId);

            const result: { isSuccess: boolean; message: string }[] = [];

            if (installments) {
                for (let i = 0; i < installments.length; i++) {
                    result[i] = (await this.repository.deleteExpense(installments[i].getId()));
                }

                const isSuccess = result.every(obj => obj.isSuccess === true);

                if (isSuccess) {
                    return {
                        message: "All installments have been deleted successfully.",
                        statusCode: HttpStatus.OK,
                        expenses: await this.getExpensesUseCase.execute(periodo),
                        isSuccess: true
                    }
                }
                return {
                    message: "An error occurred while deleting the installments!",
                    statusCode: HttpStatus.BAD_REQUEST,
                    expenses: await this.getExpensesUseCase.execute(periodo),
                    isSuccess: false
                }
            }
        }

        if ((await this.repository.deleteExpense(Number(id))).isSuccess === true) {
            return {
                message: "Expense have been deleted successfully.",
                statusCode: HttpStatus.OK,
                expenses: await this.getExpensesUseCase.execute(periodo),
                isSuccess: true
            }
        }

        return {
            message: "An error occurred while deleting the expense!",
            statusCode: HttpStatus.BAD_REQUEST,
            expenses: await this.getExpensesUseCase.execute(periodo),
            isSuccess: false
        }
    }
}