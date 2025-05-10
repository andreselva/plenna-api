import { Injectable } from "@nestjs/common";
import { ExpenseDTO } from "../DTOs/ExpenseDTO";
import { Expense } from "../Entity/Expense";
import { ExpensesRepository } from "../ExpensesRepository";
import { getChangedFields } from "src/Shared/Utils/CompareChanges";
import DateCalculator from "src/Shared/Utils/DateCalculator";
import { ExpenseResponseDTO } from "../DTOs/ExpenseResponseDTO";
import { InstallmentUpdater } from "src/Finance/InstallmentsServices/InstallmentsUpdater";

@Injectable()
export class UpdateExpense {
    constructor(
        private readonly repository: ExpensesRepository,
    ) { }

    async execute(id: string, expense: ExpenseDTO) {
        expense.id = Number(id);
        const entity = Expense.fromDTO(expense);

        if (expense.updateInstallments) {
            const queryId = Number(expense.sourceAccountId && expense.sourceAccountId > 0 ? expense.sourceAccountId : id);
            const installments = await this.repository.searchForRelatedInstallments(queryId);

            if (!installments) {
                return await this.repository.updateExpense(entity);
            }

            const changedFields = getChangedFields(installments[0], entity);

            if (changedFields) {
                installments[0] = entity;
                const dates = DateCalculator.calculate(changedFields.invoiceDueDate as string, installments.length);

                const results: ExpenseResponseDTO[] = await InstallmentUpdater<Expense, ExpenseResponseDTO>({
                    items: installments,
                    changedFields,
                    dynamicFieldProcessors: {
                        invoiceDueDate: (i) => dates[i],
                    },
                    updateFn: (item) => this.repository.updateExpense(item)
                });

                if (results) {
                    return results;
                }

                return await this.repository.updateExpense(entity);
            }


        }
        return await this.repository.updateExpense(entity)
    }
}