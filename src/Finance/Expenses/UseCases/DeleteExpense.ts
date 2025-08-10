import { Injectable } from "@nestjs/common";
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

            if (installments) {
                for (let i = 0; i < installments.length; i++) {
                    await this.repository.deleteExpense(installments[i].id);
                }
                return { expenses: await this.getExpensesUseCase.execute(periodo) };
            }
        }
        await this.repository.deleteExpense(Number(id))
        return { expenses: await this.getExpensesUseCase.execute(periodo) }
    }
}