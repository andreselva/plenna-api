import { Injectable } from "@nestjs/common";
import { RevenueDTO } from "../DTOs/RevenueDTO";
import Revenue from "../Entity/Revenue";
import RevenuesRepository from "../RevenuesRepository";
import DateCalculator from "src/Shared/Utils/DateCalculator";
import { getChangedFields } from "src/Shared/Utils/CompareChanges";
import { RevenueResponseDTO } from "../DTOs/RevenueResponseDTO";
import { InstallmentUpdater } from "src/Finance/InstallmentsServices/InstallmentsUpdater";

@Injectable()
export class UpdateRevenue {
    constructor(
        private readonly repository: RevenuesRepository
    ) { }

    async execute(id: string, revenue: RevenueDTO) {
        revenue.id = Number(id);
        const entity = Revenue.fromDTO(revenue);

        if (revenue.updateInstallments) {
            //Define o id considerado para buscar as outras parcelas relacionadas
            const queryId = Number(revenue.sourceAccountId && revenue.sourceAccountId > 0 ? revenue.sourceAccountId : id);
            const installments = await this.repository.searchForRelatedInstallments(queryId);

            if (!installments) {
                return await this.repository.updateRevenue(entity);
            }

            //Busca os campos alterados.
            const changedFields = getChangedFields(installments[0], entity);

            //Se changedFields existe e não for vazio, prosseguimos com a atualização das demais parcelas.
            if (changedFields && Object.keys(changedFields).length > 0) {
                installments[0] = entity;
                //Recalculamos as datas conforme a parcela alterada
                const dates = DateCalculator.calculate(changedFields.invoiceDueDate as string, installments.length);
                //Delega a função de atualização das parcelas para InstallmentUpdater. InstallmentUpdater é uma função higher order,
                //então, ela recebe o método updateRevenue por parâmetro.
                const results: RevenueResponseDTO[] = await InstallmentUpdater<Revenue, RevenueResponseDTO>({
                    items: installments,
                    changedFields,
                    dynamicFieldProcessors: {
                        invoiceDueDate: (i) => dates[i],
                    },
                    updateFn: (item) => this.repository.updateRevenue(item),
                });

                if (results && results.length > 0) {
                    return results;
                }

                //Se a atualização acima falhar, atualizamos somente a entity
                return await this.repository.updateRevenue(entity);
            }
        }

        return await this.repository.updateRevenue(entity);
    }
}