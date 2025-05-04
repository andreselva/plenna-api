import { ExpenseDTO } from "../DTOs/ExpenseDTO";
import { ExpensesRepository } from "../ExpensesRepository";
import { Expense } from "../Entity/Expense";
import { Injectable } from "@nestjs/common";
import InstallmentsCalculator from "src/Finance/InstallmentsCalculator";
import { ExpenseResponseDTO } from "../DTOs/ExpenseResponseDTO";

@Injectable()
export class CreateExpense {
    constructor(
        private readonly repository: ExpensesRepository,
    ) { }

    async execute(expense: ExpenseDTO) {
        const entity = Expense.fromDTO(expense);
        const firstExpense = await this.repository.createExpense(entity);

        //Só entra nesse if se houver uma quantidade de parcelas informadas e se o tipo da parcela for P (parcelada) ou F (fixa).
        if (
            firstExpense
            && (
                (firstExpense.getTypeOfInstallments() === 'P' && firstExpense.getInstallments() > 0)
                || firstExpense.getTypeOfInstallments() === 'F'
            )
        ) {
            const otherInstallments = (
                new InstallmentsCalculator(
                    firstExpense.getTypeOfInstallments() as 'P' | 'F',
                    firstExpense.getInstallments(),
                    firstExpense
                )
            ).getInstallments();

            const expensesCreated = [] as Expense[];
            //Adicionar a primeira conta gerada para retornar pro front mapeado posteriormente.
            expensesCreated.push(firstExpense);
            for (let i = 0; i < otherInstallments.length; i++) {
                //Cria as parcelas no banco de dados e as salva em um novo array para retornar pro front.
                expensesCreated.push(await this.repository.createExpense(otherInstallments[i]));
            }

            //Mapeia para retornar pro front
            return expensesCreated.map(expense => new ExpenseResponseDTO(
                expense.getId(),
                expense.getName(),
                expense.getDescription(),
                expense.getValue(),
                expense.getInvoiceDueDate(),
                expense.getIdCategory(),
                expense.getIdCreditCard()
            ));
        }

        //Se não houver parcelas, retorna diretamente a conta criada
        return new ExpenseResponseDTO(
            firstExpense.getId(),
            firstExpense.getName(),
            firstExpense.getDescription(),
            firstExpense.getValue(),
            firstExpense.getInvoiceDueDate(),
            firstExpense.getIdCategory(),
            firstExpense.getIdCreditCard()
        )
    }
}