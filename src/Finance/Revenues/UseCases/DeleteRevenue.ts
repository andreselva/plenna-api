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
                    result.push(await this.repository.deleteRevenue(installments[i].getId()));
                }

                const isSuccess = result.every(obj => obj.isSuccess === true);

                if (isSuccess) {
                    return {
                        message: 'All installments have been deleted successfully.',
                        statusCode: HttpStatus.OK,
                        revenues: await this.getRevenuesUseCase.execute(periodo),
                        isSuccess: true
                    }
                }

                return {
                    message: 'An error occurred while deleting the installments.',
                    statusCode: HttpStatus.BAD_REQUEST,
                    revenues: await this.getRevenuesUseCase.execute(periodo),
                    isSuccess: false
                }
            }
        }

        if ((await this.repository.deleteRevenue(Number(id))).isSuccess === true) {
            return {
                message: 'Revenue have been deleted successfully.',
                statusCode: HttpStatus.OK,
                revenues: await this.getRevenuesUseCase.execute(periodo),
                isSuccess: true
            }
        }

        return {
            message: 'An error occurred while deleting the revenue.',
            statusCode: HttpStatus.BAD_REQUEST,
            revenues: await this.getRevenuesUseCase.execute(periodo),
            isSuccess: false
        }
    }
}