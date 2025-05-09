import { Injectable } from "@nestjs/common";
import { RevenueDTO } from "../DTOs/RevenueDTO";
import Revenue from "../Entity/Revenue";
import RevenuesRepository from "../RevenuesRepository";
import { RevenueProps } from "../Interfaces/RevenuePropsI";
import DateCalculator from "src/Shared/Utils/DateCalculator";
import { RevenueResponseDTO } from "../DTOs/RevenueResponseDTO";

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

            const changedFields = this.setChangeFields(installments, entity);

            if (changedFields) {
                installments[0] = entity;
                return await this.#updateInstallments(installments, changedFields);
            }
        }

        return await this.repository.updateRevenue(entity);
    }

    private setChangeFields(installments: Revenue[], entity: Revenue): Partial<RevenueProps> {
        const original = installments[0];
        const updatedFields: Partial<RevenueProps> = {};

        for (const key of Object.keys(entity) as (keyof Revenue)[]) {
            const originalValue = original[key];
            const newValue = entity[key];

            if (key === 'value') {
                Number(newValue);
                Number(originalValue);
            }

            if (originalValue !== newValue) {
                updatedFields[key] = newValue;
            }
        }

        return updatedFields;
    }

    async #updateInstallments(installments: Revenue[], changedFields: RevenueProps) {
        let dates: string[];

        if (changedFields.invoiceDueDate) {
            dates = DateCalculator.calculate(changedFields.invoiceDueDate, installments.length)
        }

        for (let i = 1; i < installments.length; i++) {
            const installment = installments[i];

            Object.keys(changedFields).forEach((field) => {
                const key = field as keyof Revenue;

                if (key === 'invoiceDueDate') {
                    installment[key] = dates[i];
                } else {
                    if (key === 'value' && typeof changedFields[key] === 'number') {
                        installment[key] = changedFields[key];
                    }
                }
            });
        }

        const result: RevenueResponseDTO[] = [];

        for (const installment of installments) {
            const updated = await this.repository.updateRevenue(installment);
            result.push(updated);
        }

        if (result) {
            return result;
        }
    }
}