import { HttpStatus, Injectable } from "@nestjs/common";
import RevenuesRepository from "../RevenuesRepository";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import GetRevenues from "./GetRevenues";

@Injectable()
export class DeleteRevenue {
    constructor(
        private readonly repository: RevenuesRepository,
        private readonly getRevenuesUseCase: GetRevenues,
    ) { }

    async execute(id: number, deleteInstallments: boolean, sourceAccountId: number, periodo: PeriodoDTO) {
        if (deleteInstallments) {
            const queryId = sourceAccountId > 0 ? sourceAccountId : id;
            const installments = await this.repository.searchForRelatedInstallments(queryId);

            if (installments) {
                const result: { isSuccess: boolean, message: string }[] = [];

                for (let i = 0; i < installments.length; i++) {
                    result.push(await this.repository.deleteRevenue(installments[i].id));
                }

                return await this.getRevenuesUseCase.execute(periodo);
            }
        }
        await this.repository.deleteRevenue(Number(id));
        return await this.getRevenuesUseCase.execute(periodo);
    }
}