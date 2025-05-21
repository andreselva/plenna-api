import { HttpStatus, Injectable } from "@nestjs/common";
import { RevenueDTO } from "../DTOs/RevenueDTO";
import Revenue from "../Entity/Revenue";
import RevenuesRepository from "../RevenuesRepository";
import DateCalculator from "src/Shared/Utils/DateCalculator";
import { getChangedFields } from "src/Shared/Utils/CompareChanges";
import { RevenueResponseDTO } from "../DTOs/RevenueResponseDTO";
import { InstallmentUpdater } from "src/Finance/InstallmentsServices/InstallmentsUpdater";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import GetRevenues from "./GetRevenues";

@Injectable()
export class UpdateRevenue {
    constructor(
        private readonly repository: RevenuesRepository,
        private readonly getRevenuesUseCase: GetRevenues
    ) { }

    async execute(id: string, revenue: RevenueDTO, periodo: PeriodoDTO) {
        revenue.id = Number(id);
        const entity = Revenue.fromDTO(revenue);

        if (revenue.updateInstallments) {
            const installments = await this.searchRelatedInstallments(revenue);

            if (!installments) {
                return await this.repository.updateRevenue(entity);
            }

            //Busca os campos alterados.
            const changedFields = getChangedFields(installments[0], entity);

            //Se changedFields existe e não for vazio, prosseguimos com a atualização das demais parcelas.
            if (changedFields && Object.keys(changedFields).length > 0) {
                installments[0] = entity;
                let dates: string[] = [];
                if (changedFields.invoiceDueDate !== undefined) {
                    //Recalculamos as datas conforme a parcela alterada
                    dates = DateCalculator.calculate(changedFields.invoiceDueDate, installments.length);
                }
                //Delega a atualização das parcelas para InstallmentUpdater. InstallmentUpdater é uma função higher order,
                //então, ela recebe o método updateRevenue por parâmetro.
                const results: RevenueResponseDTO[] = await InstallmentUpdater<Revenue, RevenueResponseDTO>({
                    items: installments,
                    changedFields,
                    dynamicFieldProcessors: {
                        invoiceDueDate: (i) => dates[i],
                    },
                    updateFn: (item) => this.repository.updateRevenue(item),
                });

                //Se a atualização acima falhar, atualizamos somente a entity
                if (!results || !(results.length > 0)) {
                    const result = await this.repository.updateRevenue(entity);
                    if (!result) {
                        //Se a atualização da entity falhar, retornamos erro.
                        return {
                            message: 'Failed to update installments',
                            statusCode: HttpStatus.BAD_REQUEST,
                            revenues: await this.getRevenuesUseCase.execute(periodo),
                            isSuccess: false,
                        };
                    }
                    //Se a atualização entity for bem sucedida, retornamos sucesso, 
                    //e sinalizamos que as demais parcelas não foram atualizadas.
                    return {
                        message: 'Installment updated successfully, but the update of the installments failed.',
                        statusCode: HttpStatus.MULTI_STATUS,
                        results: [
                            {
                                revenue: 'mainEntity',
                                isSuccess: true,
                            },
                            {
                                revenue: 'installments',
                                isSuccess: false,
                            }
                        ],
                        revenues: await this.getRevenuesUseCase.execute(periodo),
                        isSucess: false,
                    }
                }
                //Se a atualização das parcelas for bem sucedida, retornamos sucesso.
                return {
                    message: 'Installment updated successfully',
                    statusCode: HttpStatus.OK,
                    revenues: await this.getRevenuesUseCase.execute(periodo),
                    isSuccess: true,
                }
            }
        }

        const result = await this.repository.updateRevenue(entity);

        if (!result) {
            return {
                message: 'Failed to update revenue',
                statusCode: HttpStatus.BAD_REQUEST,
                revenues: await this.getRevenuesUseCase.execute(periodo),
                isSuccess: false,
            };
        }
        //Se a atualização da parcela principal for bem sucedida, retornamos sucesso.
        return {
            message: 'Revenue updated successfully',
            statusCode: HttpStatus.OK,
            revenues: await this.getRevenuesUseCase.execute(periodo),
            isSuccess: true,
        };
    }

    private async searchRelatedInstallments(revenue: RevenueDTO) {
        if (revenue.sourceAccountId && revenue.sourceAccountId > 0) {
            const consideredId = revenue.sourceAccountId;
            return await this.repository.searchForRelatedInstallments(consideredId, revenue.id);
        }

        if (revenue.id && revenue.id !== undefined && revenue.id > 0) {
            return await this.repository.searchForRelatedInstallments(revenue.id);
        }
        throw new Error("Considered ID invalid!");
    }
}