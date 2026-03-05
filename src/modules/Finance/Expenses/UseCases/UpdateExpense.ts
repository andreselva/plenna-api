import { Injectable } from "@nestjs/common";
import { ExpenseDTO } from "../DTOs/ExpenseDTO";
import { ExpensesRepository } from "../ExpensesRepository";
import { getChangedFields } from "src/Shared/Utils/CompareChanges";
import DateCalculator from "src/Shared/Utils/DateCalculator";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import { GetExpenses } from "./GetExpenses";
import { ExpenseStatus } from "../Types/expense.status.type";
import { Expense } from "src/EntityModels/Expense";
import AssociateExpensesToInvoiceUseCase from "../../Invoices/UseCases/AssociateExpensesToInvoice";
import { InstallmentUpdater } from "../../InstallmentsServices/InstallmentsUpdater";

@Injectable()
export class UpdateExpense {
    constructor(
        private readonly repository: ExpensesRepository,
        private readonly getExpensesUseCase: GetExpenses,
        private readonly associateExpensesToInvoices: AssociateExpensesToInvoiceUseCase
    ) { }

    async execute(id: number, expense: ExpenseDTO, periodo: PeriodoDTO) {
        expense.id = id;
        const entity = Expense.fromDTO(expense);

        if (entity.idInvoice === 0 && !entity.linkToInvoice) {
            entity.idCreditCard = 0;
        }

        if (expense.updateInstallments) {
            //Define id considerado para buscar as outras parcelas
            const installments = await this.searchRelatedInstallments(expense);

            //Se não retornar nada, atualizamos somente a entity.
            if (!installments) {
                return await this.repository.saveExpense(entity);
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

                //Delega a atualização das parcelas para InstallmentUpdater.
                await InstallmentUpdater<Expense, Expense>({
                    items: installments,
                    changedFields,
                    dynamicFieldProcessors: {
                        invoiceDueDate: (i) => dates[i],
                    },
                    updateFn: (item) => this.repository.saveExpense(item)
                });

                //Associa à fatura
                if (expense.linkToInvoice) {
                    await this.associateExpensesToInvoices.associate(installments);
                }
                
                return { expenses: await this.getExpensesUseCase.execute(periodo) }
            }
        }

        await this.repository.saveExpense(entity);
        return { expenses: await this.getExpensesUseCase.execute(periodo) }
    }

    private async searchRelatedInstallments(expense: ExpenseDTO) {
        if (expense.sourceAccountId) {
            const consideredId = Number(expense.sourceAccountId);
            return await this.repository.searchForRelatedInstallments(consideredId, expense.id);
        }

        if (expense.id && expense.id !== undefined && expense.id > 0) {
            return await this.repository.searchForRelatedInstallments(expense.id);
        }
        throw new Error("Considered ID invalid!");
    }

    public async updateExpenseStatus(id: number, paymentDate: string|null) {
        const expense = await this.repository.getExpenseById(id);
        if (!expense) {
            throw new Error("Expense not found");
        }

        const payments = await this.repository.getPayments(id);
        const totalPayments = payments.reduce((acc, p) => acc + p.value, 0);
        if (totalPayments <= 0 && payments.length > 0) {
            await this.repository.updateStatus(id, ExpenseStatus.REVERSED, null);
            return;
        }
        
        const expenseValue = expense.value;
        const status = this.defineStatus(totalPayments, expenseValue);
        await this.repository.updateStatus(id, status, paymentDate);
        return { status: status };
    }

    private defineStatus(totalPayments: number, expenseValue: number): ExpenseStatus {
        if (totalPayments >= expenseValue) {
            return ExpenseStatus.PAID;
        } else if (totalPayments > 0) {
            return ExpenseStatus.PARTIAL;
        } else {
            return ExpenseStatus.PENDING;
        }
    }
}