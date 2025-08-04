import { ExpenseDTO } from "../DTOs/ExpenseDTO";
import { ExpensesRepository } from "../ExpensesRepository";
import { Expense } from "../Entity/Expense";
import { Injectable } from "@nestjs/common";
import InstallmentsCalculator from "src/Finance/InstallmentsServices/InstallmentsCalculator";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import { GetExpenses } from "./GetExpenses";
import AssociateExpensesToInvoiceUseCase from "src/Finance/Invoices/UseCases/AssociateExpensesToInvoice";

@Injectable()
export class CreateExpense {
    constructor(
        private readonly repository: ExpensesRepository,
        private readonly getExpensesUseCase: GetExpenses,
        private readonly associateExpensesToInvoiceUC: AssociateExpensesToInvoiceUseCase
    ) { }

    async execute(expense: ExpenseDTO, periodo: PeriodoDTO) {
        const entity = new Expense(expense);
        if (entity.getIdInvoice() === 0 && !entity.linkToInvoice) {
            entity.setIdCreditCard(0);
        }
        const firstExpense = await this.repository.createExpense(entity);

        //Só entra nesse if se houver uma quantidade de parcelas informadas e se 
        // o tipo da parcela for P (parcelada), ou se o tipo for F (fixa).
        if (firstExpense &&
            ((firstExpense.getTypeOfInstallments() === 'P' && firstExpense.getInstallments() > 0) || firstExpense.getTypeOfInstallments() === 'F')) {
            const otherInstallments = (new InstallmentsCalculator(
                firstExpense.getTypeOfInstallments() as 'P' | 'F',
                firstExpense.getInstallments(),
                firstExpense)).getInstallments();

            const expensesCreated = [] as Expense[];
            //Adicionar a primeira conta gerada para retornar pro front mapeado posteriormente.
            expensesCreated.push(firstExpense);
            for (let i = 0; i < otherInstallments.length; i++) {
                otherInstallments[i].setSourceAccountId(firstExpense.getId()); //Salva o id da conta de origem para associar as parcelas.
                //Cria as parcelas no banco de dados e as salva em um novo array para retornar pro front.
                expensesCreated.push(await this.repository.createExpense(otherInstallments[i]));
            }

            //Associa à fatura
            if (expense.linkToInvoice) {
                await this.associateExpensesToInvoiceUC.associate(expensesCreated);
            }
        }

        if (expense.linkToInvoice) {
            await this.associateExpensesToInvoiceUC.associate([firstExpense]);
        }

        return { expenses: await this.getExpensesUseCase.execute(periodo) }
    }
}