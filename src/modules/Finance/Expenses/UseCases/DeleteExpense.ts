import { BadRequestException, Injectable } from "@nestjs/common";
import { ExpensesRepository } from "../ExpensesRepository";

@Injectable()
export class DeleteExpense {
    constructor(
        private readonly repository: ExpensesRepository,
    ) { }

    async execute(id: number, deleteInstallments: boolean, sourceAccountId: number) {
        const payments = await this.repository.getPayments(id);
        if (payments.length > 0) {
            const sumAllPayments = payments.reduce((sum, payment) => sum + payment.value, 0);
            if (sumAllPayments > 0) {
                throw new BadRequestException(
                    'Não é possível excluir despesas com pagamentos registrados. Por favor, verifique as despesas e suas parcelas, estorne os pagamentos e tente novamente.'
                );
            }
            await this.repository.archive(id);
        } else {
            await this.repository.deleteExpense(id);
        }


        if (deleteInstallments && sourceAccountId >= 0) {
            const queryId = sourceAccountId > 0 ? sourceAccountId : id;
            const installments = await this.repository.searchForRelatedInstallments(queryId);
            if (installments) {
                for (let i = 0; i < installments.length; i++) {
                    await this.execute(installments[i].id, false, id);
                }
            }
        }
    }
}