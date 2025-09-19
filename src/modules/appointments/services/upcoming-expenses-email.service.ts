import { Injectable, Logger } from "@nestjs/common";
import { DateTime } from "luxon";
import { AppointmentsFinanceRepository } from "../repositories/appointments-finance.repository";
import { EmailNotificationService } from "./email-notification.service";
import Client from "src/EntityModels/Client";
import { Expense } from "src/EntityModels/Expense";
import Invoice from "src/EntityModels/invoice";

export interface ExpenseSummary {
  id: number;
  name: string;
  description: string;
  value: number;
  dueDate: string;
}

export interface InvoiceSummary {
  id: number;
  name: string;
  dueDate: string;
  value: number;
  expenses: ExpenseSummary[];
}

export interface UpcomingExpensesEmailPayload {
  client: { id: number; name: string; email: string };
  range: { start: string; end: string; days: number };
  expenses: ExpenseSummary[];
  invoices: InvoiceSummary[];
}

@Injectable()
export class UpcomingExpensesEmailService {
  private readonly logger = new Logger(UpcomingExpensesEmailService.name);
  private readonly defaultLeadDays = 15;
  private readonly timezone = 'America/Sao_Paulo';

  constructor(
    private readonly financeRepository: AppointmentsFinanceRepository,
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  async process(clientId: number): Promise<void> {
    const payload = await this.composePayload(clientId, this.defaultLeadDays);
    if (!payload) {
      this.logger.debug(`Nenhum dado encontrado para envio do e-mail de contas próximas do cliente ${clientId}.`);
      return;
    }

    await this.emailNotificationService.sendUpcomingExpensesEmail(payload);
  }

  async composePayload(clientId: number, leadDays: number): Promise<UpcomingExpensesEmailPayload | null> {
    const client = await this.financeRepository.findClientById(clientId);
    if (!client || !client.clientEmail) {
      this.logger.warn(`Cliente ${clientId} não possui e-mail cadastrado. O agendamento será ignorado.`);
      return null;
    }

    const { start, end } = this.buildRange(leadDays);
    const expenses = await this.financeRepository.findExpensesWithoutInvoiceDueBetween(clientId, start, end);
    const invoices = await this.financeRepository.findInvoicesDueBetween(clientId, start, end);

    if (expenses.length === 0 && invoices.length === 0) {
      return null;
    }

    const expenseSummaries = this.mapExpenses(expenses);
    const invoiceSummaries = await this.mapInvoices(invoices, client, clientId);

    return {
      client: { id: client.id, name: client.clientName, email: client.clientEmail },
      range: { start, end, days: leadDays },
      expenses: expenseSummaries,
      invoices: invoiceSummaries,
    };
  }

  private buildRange(days: number): { start: string; end: string } {
    const now = DateTime.now().setZone(this.timezone);
    const start = now.startOf('day').toISODate() as string;
    const end = now.plus({ days }).endOf('day').toISODate() as string;
    return { start, end };
  }

  private mapExpenses(expenses: Expense[]): ExpenseSummary[] {
    return expenses
      .map((expense) => ({
        id: expense.id,
        name: expense.name,
        description: expense.description,
        value: Number(expense.value),
        dueDate: expense.invoiceDueDate,
      }))
      .sort((a, b) => this.sortByDate(a.dueDate, b.dueDate));
  }

  private async mapInvoices(
    invoices: Invoice[],
    client: Client,
    clientId: number,
  ): Promise<InvoiceSummary[]> {
    const summaries: InvoiceSummary[] = [];

    for (const invoice of invoices) {
      const relatedExpenses = await this.financeRepository.findExpensesByInvoiceId(clientId, invoice.id);
      if (!relatedExpenses || relatedExpenses.length === 0) {
        continue;
      }

      const expenses = this.mapExpenses(relatedExpenses);
      const totalValue = expenses.reduce((acc, expense) => acc + Number(expense.value), 0);

      summaries.push({
        id: invoice.id,
        name: invoice.name || `${client.clientName} - Fatura ${invoice.id}`,
        dueDate: invoice.dueDate,
        value: totalValue,
        expenses,
      });
    }

    return summaries.sort((a, b) => this.sortByDate(a.dueDate, b.dueDate));
  }

  private sortByDate(a: string, b: string): number {
    const dateA = DateTime.fromISO(a, { zone: this.timezone });
    const dateB = DateTime.fromISO(b, { zone: this.timezone });
    if (!dateA.isValid || !dateB.isValid) {
      return 0;
    }
    return dateA.toMillis() - dateB.toMillis();
  }
}
