import { BadRequestException, Injectable } from "@nestjs/common";
import RevenuesRepository from "../RevenuesRepository";

@Injectable()
export class DeleteRevenue {
    constructor(
        private readonly repository: RevenuesRepository
    ) { }

    
    async execute(id: number, deleteInstallments: boolean, sourceAccountId: number) {
        const payments = await this.repository.getTotalPayments(id);
        if (payments.length > 0) {
            const sumAllPayments = payments.reduce((sum, payment) => sum + payment.value, 0);
            if (sumAllPayments > 0) {
                throw new BadRequestException(
                    'Não é possível excluir receitas com pagamentos registrados. Por favor, verifique as receitas e suas parcelas, estorne os pagamentos e tente novamente.'
                );
            }
            await this.repository.archive(id);
        } else {
            await this.repository.deleteRevenue(id);
        }
        
        if (deleteInstallments) {
            const queryId = sourceAccountId > 0 ? sourceAccountId : id;
            const installments = await this.repository.searchForRelatedInstallments(queryId);
            if (installments) {
                for (let i = 0; i < installments.length; i++) {
                    await this.execute(installments[i].id, false, queryId);
                }
            }
        }
    }
}