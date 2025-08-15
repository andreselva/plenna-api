import { ExpenseDTO } from "../DTOs/ExpenseDTO";
import { ExpensesRepository } from "../ExpensesRepository";
import { Injectable } from "@nestjs/common";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import { GetExpenses } from "./GetExpenses";
import { Expense } from "src/EntityModels/Expense";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import AssociateExpensesToInvoiceUseCase from "../../Invoices/UseCases/AssociateExpensesToInvoice";
import InstallmentsCalculator from "../../InstallmentsServices/InstallmentsCalculator";

@Injectable()
export class CreateExpense {
    constructor(
        private readonly repository: ExpensesRepository,
        private readonly getExpensesUseCase: GetExpenses,
        private readonly associateExpensesToInvoiceUC: AssociateExpensesToInvoiceUseCase,
        private readonly authContext: AuthContextService
    ) { }

    async execute(expense: ExpenseDTO, periodo: PeriodoDTO) {
        const entity = Expense.fromDTO(expense);
        if (entity.idInvoice === 0 && !entity.linkToInvoice) {
            entity.idCreditCard = 0;
        }
        const firstExpense = await this.repository.saveExpense(entity);

        //Só entra nesse if se houver uma quantidade de parcelas informadas e se 
        // o tipo da parcela for P (parcelada), ou se o tipo for F (fixa).
        if (firstExpense &&
            ((firstExpense.typeOfInstallment === 'P' && firstExpense.installments > 0) || firstExpense.typeOfInstallment === 'F')) {
            const otherInstallments = (new InstallmentsCalculator(
                firstExpense.typeOfInstallment,
                firstExpense.installments,
                firstExpense)).getInstallments();

            const expensesCreated = [] as Expense[];
            //Adicionar a primeira conta gerada para retornar pro front mapeado posteriormente.
            expensesCreated.push(firstExpense);
            for (let i = 0; i < otherInstallments.length; i++) {
                otherInstallments[i].sourceAccountId = firstExpense.id; //Salva o id da conta de origem para associar as parcelas.
                //Cria as parcelas no banco de dados e as salva em um novo array para retornar pro front.
                expensesCreated.push(await this.repository.saveExpense(otherInstallments[i]));
            }

            //Associa à fatura
            if (expense.linkToInvoice) {
                await this.associateExpensesToInvoiceUC.associate(expensesCreated);
            }
            return await this.getExpensesUseCase.execute(periodo);
        }

        if (expense.linkToInvoice) {
            await this.associateExpensesToInvoiceUC.associate([firstExpense]);
        }

        return await this.getExpensesUseCase.execute(periodo)
    }
}