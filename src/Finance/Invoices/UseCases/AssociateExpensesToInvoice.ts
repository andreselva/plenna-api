import { Injectable, Logger } from "@nestjs/common";
import InvoicesRepository from "../invoices.repository";
import { Expense } from "src/Finance/Expenses/Entity/Expense";
import GetInvoicesUseCase from "./GetInvoicesUseCase";
import Invoice from "../Entity/invoice";
import CreateInvoiceUseCase from "./CreateInvoiceUseCase";
import InvoiceSettingsDTO from "../DTOs/invoice.settings.dto";

@Injectable()
export default class AssociateExpensesToInvoiceUseCase {
    private readonly logger = new Logger(AssociateExpensesToInvoiceUseCase.name);

    constructor(
        private readonly repository: InvoicesRepository,
        private readonly getInvoicesUC: GetInvoicesUseCase,
        private readonly createInvoiceUC: CreateInvoiceUseCase
    ) { }

    async associate(expenses: Expense[]) {
        if (!expenses || expenses.length === 0) {
            return;
        }

        //Agrupa as despesas por ID do cartão de crédito
        const expensesByCreditCard = this.groupExpensesByCreditCard(expenses);

        // Processa cada grupo de despesas separadamente
        for (const [idCreditCard, singleCardExpenses] of expensesByCreditCard.entries()) {
            try {
                await this.processExpensesForCard(idCreditCard, singleCardExpenses);
            } catch (err) {
                this.logger.error(`Falha ao processar despesas para o cartão ${idCreditCard}. Erro: ${err.message}`);
            }
        }
    }

    private async processExpensesForCard(idCreditCard: number, expenses: Expense[]) {
        const settingsInvoice = await this.repository.getSettingsInvoice(idCreditCard) as InvoiceSettingsDTO;
        if (!settingsInvoice) {
            throw new Error(`Configurações de fatura não encontradas para o cartão com ID: ${idCreditCard}`);
        }

        // Busca as faturas existentes
        const { invoices } = await this.getInvoicesUC.getRelatedInvoiceBankAccount(idCreditCard);
        const availableInvoices = new Map<string, Invoice>();
        invoices.forEach(inv => availableInvoices.set(inv.getDueDate(), inv));

        for (const expense of expenses) {
            const dueDate = expense.getInvoiceDueDate();
            let invoiceToExpense = availableInvoices.get(dueDate);

            // Se a fatura não existir, cria e a adiciona ao mapa local
            if (!invoiceToExpense) {
                this.logger.log(`Fatura não encontrada para data ${dueDate}. Criando uma nova...`);

                const createdInvoice = await this.createInvoiceUC.create(settingsInvoice);

                if (createdInvoice) {
                    availableInvoices.set(createdInvoice.getDueDate(), createdInvoice);
                    invoiceToExpense = createdInvoice;
                } else {
                    this.logger.error(`A criação da fatura para a data ${dueDate} falhou e não retornou um resultado válido.`);
                }
            }

            if (invoiceToExpense) {
                const invoiceId = invoiceToExpense.getId();
                if (invoiceId === null || invoiceId === undefined) {
                    this.logger.error(`A fatura para a data ${dueDate} foi encontrada/criada mas não possui um ID.`);
                    continue;
                }
                expense.setIdInvoice(invoiceId);
                await this.repository.updateExpense(expense);
            } else {
                this.logger.error(`Não foi possível encontrar ou criar uma fatura para a despesa ${expense.getId()}`);
            }
        }
    }

    /**
     * Agrupa uma lista de despesas pelo ID do cartão de crédito.
     * @param expenses - A lista de despesas a ser agrupada.
     * @returns Um Map onde a chave é o ID do cartão e o valor é uma lista de despesas.
     */
    private groupExpensesByCreditCard(expenses: Expense[]): Map<number, Expense[]> {
        const grouped = new Map<number, Expense[]>();

        for (const expense of expenses) {
            const idCreditCard = expense.getIdCreditCard();
            if (!grouped.has(idCreditCard)) {
                grouped.set(idCreditCard, []);
            }
            grouped.get(idCreditCard)?.push(expense);
        }

        return grouped;
    }
}