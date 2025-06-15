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
        const entity = Expense.fromDTO(expense);
        const firstExpense = await this.repository.createExpense(entity);

        //Só entra nesse if se houver uma quantidade de parcelas informadas e se 
        // o tipo da parcela for P (parcelada), ou se o tipo for F (fixa).
        if (
            firstExpense &&
            ((firstExpense.getTypeOfInstallments() === 'P' && firstExpense.getInstallments() > 0) || firstExpense.getTypeOfInstallments() === 'F')
        ) {
            const otherInstallments = (new InstallmentsCalculator(
                firstExpense.getTypeOfInstallments() as 'P' | 'F',
                firstExpense.getInstallments(),
                firstExpense)).getInstallments();

            const expensesCreated = [] as Expense[];
            //Adicionar a primeira conta gerada para retornar pro front mapeado posteriormente.
            expensesCreated.push(firstExpense);
            for (let i = 0; i < otherInstallments.length; i++) {
                //Cria as parcelas no banco de dados e as salva em um novo array para retornar pro front.
                expensesCreated.push(await this.repository.createExpense(otherInstallments[i]));
            }

            if (expense.linkToInvoice) {
                await this.associateExpensesToInvoiceUC.associate(expensesCreated);
            }

            if (!firstExpense && !(expensesCreated.length > 0)) {
                return {
                    message: "Failed to create expense",
                    statusCode: 400,
                    expenses: await this.getExpensesUseCase.execute(periodo),
                    isSucess: false,
                }
            }

            return {
                message: "Expense created successfully",
                statusCode: 201,
                expenses: await this.getExpensesUseCase.execute(periodo),
                isSucess: true,
            }
        }

        if (!firstExpense) {
            return {
                message: "Failed to create expense",
                statusCode: 400,
                expenses: await this.getExpensesUseCase.execute(periodo),
                isSucess: false,
            }
        }

        return {
            message: "Expense created successfully",
            statusCode: 201,
            expenses: await this.getExpensesUseCase.execute(periodo),
            isSucess: true,
        }
    }
}