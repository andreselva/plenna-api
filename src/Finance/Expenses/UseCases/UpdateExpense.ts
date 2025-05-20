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
            //Define id considerado para buscar as outras parcelas
            const installments = await this.searchRelatedInstallments(expense);

            //Se não retornar nada, atualizamos somente a entity.
            if (!installments) {
                return await this.repository.updateExpense(entity);
            }

            //Compara os campos que estão diferentes.
            const changedFields = getChangedFields(installments[0], entity);

            //Se changedFields existir e não for vazio, prosseguimos com a atualização das outras parcelas.
            if (changedFields && Object.keys(changedFields).length > 0) {
                installments[0] = entity;

                let dates: string[] = [];
                if (changedFields.invoiceDueDate !== undefined) {
                    //Recalculamos as datas conforme a parcela alterada
                    dates = DateCalculator.calculate(changedFields.invoiceDueDate, installments.length);
                }

                //Delega a atualização das parcelas para InstallmentUpdater. InstallmentUpdater é uma função higher order,
                //então, ela recebe o método updateExpense por parâmetro.
                const results: ExpenseResponseDTO[] = await InstallmentUpdater<Expense, ExpenseResponseDTO>({
                    items: installments,
                    changedFields,
                    dynamicFieldProcessors: {
                        invoiceDueDate: (i) => dates[i],
                    },
                    updateFn: (item) => this.repository.updateExpense(item)
                });

                if (results && results.length > 0) {
                    return results;
                }

                //Se a atualização acima falhar, atualizamos somente a entity
                return await this.repository.updateExpense(entity);
            }
        }
        return await this.repository.updateExpense(entity)
    }

    private async searchRelatedInstallments(expense: ExpenseDTO) {
        if (expense.sourceAccountId && expense.sourceAccountId > 0) {
            const consideredId = expense.sourceAccountId;
            return await this.repository.searchForRelatedInstallments(consideredId, expense.id);
        }

        if (expense.id && expense.id !== undefined && expense.id > 0) {
            return await this.repository.searchForRelatedInstallments(expense.id);
        }
        throw new Error("Considered ID invalid!");
    }
}