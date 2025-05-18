import { HttpStatus, Injectable } from "@nestjs/common";
import RevenuesRepository from "../RevenuesRepository";
import { FormatDate } from "src/Shared/Utils/FormatDate";
import PeriodoDTO from "src/DTOs/PeriodoDTO";

@Injectable()
export class DeleteRevenue {
    constructor(
        private readonly repository: RevenuesRepository
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
                        revenues: (await this.repository.getRevenues(periodo)).map(revenue => ({
                            ...revenue,
                            invoiceDueDate: FormatDate.formatToYYYYMMDD(revenue.invoiceDueDate),
                        }))
                    }
                }

                return {
                    message: 'An error occurred while deleting the installments.',
                    statusCode: HttpStatus.BAD_REQUEST
                }
            }
        }

        if ((await this.repository.deleteRevenue(Number(id))).isSuccess === true) {
            return {
                message: 'Revenue have been deleted successfully.',
                statusCode: HttpStatus.OK,
                revenues: (await this.repository.getRevenues(periodo)).map(revenue => ({
                    ...revenue,
                    invoiceDueDate: FormatDate.formatToYYYYMMDD(revenue.invoiceDueDate)
                }))
            }
        }
    }
}