import { ExpenseDTO } from "../DTOs/ExpenseDTO";
import { ExpensesRepository } from "../ExpensesRepository";
import { Injectable } from "@nestjs/common";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import { GetExpenses } from "./GetExpenses";
import { Expense } from "src/EntityModels/Expense";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import AssociateExpensesToInvoiceUseCase from "../../Invoices/UseCases/AssociateExpensesToInvoice";
import InstallmentsCalculator from "../../InstallmentsServices/InstallmentsCalculator";
import { FinancialEventsService } from "../../core/financial-events/financial-events.service";
import { FinancialEventsEnum } from "src/enum/financial-events.enum";
import { PaymentType } from "../../Payment/Types/payment.type";

@Injectable()
export class CreateExpense {
    constructor(
        private readonly repository: ExpensesRepository,
        private readonly getExpensesUseCase: GetExpenses,
        private readonly associateExpensesToInvoiceUC: AssociateExpensesToInvoiceUseCase,
        private readonly authContext: AuthContextService,
        private readonly financialEvents: FinancialEventsService,
    ) { }

    async execute(expense: ExpenseDTO, periodo: PeriodoDTO) {
        const entity = Expense.fromDTO(expense);
        if (entity.idInvoice === 0 && !entity.linkToInvoice) {
            entity.idCreditCard = 0;
        }
        const firstExpense = await this.repository.saveExpense(entity);
        await this.registerExpenseRecognized(firstExpense);

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
                const installment = await this.repository.saveExpense(otherInstallments[i]);
                await this.registerExpenseRecognized(installment);
                expensesCreated.push(installment);
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

    private async registerExpenseRecognized(expense: Expense): Promise<void> {
        if (!expense?.id || !expense.idBankAccount || expense.idBankAccount <= 0) {
            return;
        }
        await this.financialEvents.register({
            accountId: expense.idBankAccount,
            type: FinancialEventsEnum.EXPENSE_RECOGNIZED,
            amount: expense.value,
            referenceType: PaymentType.EXPENSE,
            referenceId: expense.id,
        });
    }
}