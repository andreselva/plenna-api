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
            const queryId = Number(revenue.sourceAccountId && revenue.sourceAccountId > 0 ? revenue.sourceAccountId : id);
            const installments = await this.repository.searchForRelatedInstallments(queryId);

            if (!installments) {
                return await this.repository.updateRevenue(entity);
            }

            const changedFields = getChangedFields(installments[0], entity);

            if (changedFields && Object.keys(changedFields).length > 0) {
                installments[0] = entity;
                const dates = DateCalculator.calculate(changedFields.invoiceDueDate as string, installments.length);
                const results: RevenueResponseDTO[] = await InstallmentUpdater<Revenue, RevenueResponseDTO>({
                    items: installments,
                    changedFields,
                    dynamicFieldProcessors: {
                        invoiceDueDate: (i) => dates[i],
                    },
                    updateFn: (item) => this.repository.updateRevenue(item),
                });

                if (results) {
                    return results;
                }

                return await this.repository.updateRevenue(entity);
            }
        }

        return await this.repository.updateRevenue(entity);
    }
}