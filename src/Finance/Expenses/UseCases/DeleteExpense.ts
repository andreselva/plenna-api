import { HttpStatus, Injectable } from "@nestjs/common";
import { ExpensesRepository } from "../ExpensesRepository";

@Injectable()
export class DeleteExpense {
    constructor(
        private readonly repository: ExpensesRepository,
    ) { }

    async execute(id: number, deleteInstallments: boolean, sourceAccountId: number) {
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
                        message: "Todas as despesas foram excluídas com sucesso!",
                        statusCode: HttpStatus.OK
                    }
                }
                return {
                    message: "Ocorreu um erro ao excluir as despesas!",
                    statusCode: HttpStatus.BAD_REQUEST
                }
            }
        }
        return await this.repository.deleteExpense(Number(id));
    }
}