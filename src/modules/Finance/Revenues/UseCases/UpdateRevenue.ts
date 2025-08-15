import { Injectable } from "@nestjs/common";
import { RevenueDTO } from "../DTOs/RevenueDTO";
import RevenuesRepository from "../RevenuesRepository";
import DateCalculator from "src/Shared/Utils/DateCalculator";
import { getChangedFields } from "src/Shared/Utils/CompareChanges";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import GetRevenues from "./GetRevenues";
import Revenue from "src/EntityModels/Revenue";
import { InstallmentUpdater } from "../../InstallmentsServices/InstallmentsUpdater";

@Injectable()
export class UpdateRevenue {
    constructor(
        private readonly repository: RevenuesRepository,
        private readonly getRevenuesUseCase: GetRevenues
    ) { }

    async execute(id: number, revenue: RevenueDTO, periodo: PeriodoDTO) {
        revenue.id = id;
        const entity = Revenue.fromDTO(revenue);

        if (revenue.updateInstallments) {
            const installments = await this.searchRelatedInstallments(revenue);

            if (!installments) {
                return await this.repository.saveRevenue(entity);
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
                //Delega a atualização das parcelas para InstallmentUpdater.
                await InstallmentUpdater<Revenue, Revenue>({
                    items: installments,
                    changedFields,
                    dynamicFieldProcessors: {
                        invoiceDueDate: (i) => dates[i],
                    },
                    updateFn: (item) => this.repository.saveRevenue(item),
                });

                return await this.getRevenuesUseCase.execute(periodo);
            }
        }

        await this.repository.saveRevenue(entity);
        return await this.getRevenuesUseCase.execute(periodo);
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