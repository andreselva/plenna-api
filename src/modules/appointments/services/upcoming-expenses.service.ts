import { Injectable, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';
import { Expense } from 'src/EntityModels/Expense';
import Invoice from 'src/EntityModels/invoice';
import { AppointmentJobData } from '../types/appointment-job-data.type';
import AppointmentsRepository from '../appointments.repository';

export interface UpcomingInvoiceSummary {
  invoice: Invoice;
  expenses: Expense[];
  totalValue: number;
}

export interface UpcomingExpensesSummary {
  period: {
    start: string;
    end: string;
    days: number;
    timezone: string;
  };
  expensesWithoutInvoice: Expense[];
  invoices: UpcomingInvoiceSummary[];
}

@Injectable()
export class UpcomingExpensesService {
  private readonly logger = new Logger(UpcomingExpensesService.name);

  constructor(private readonly repository: AppointmentsRepository) {}

  async getSummary(
    job: AppointmentJobData<{ days?: number }>,
    timezone: string,
  ): Promise<UpcomingExpensesSummary> {
    const days = job.config?.days && job.config.days > 0 ? job.config.days : 45;
    const now = DateTime.now().setZone(timezone).startOf('day');
    const end = now.plus({ days }).endOf('day');

    const period = {
      start: now.toISODate() as string,
      end: end.toISODate() as string,
      days,
      timezone,
    };

    const expenses = await this.repository.loadExpenses(job.clientId, period.start, period.end);
    const expensesWithoutInvoice = expenses.filter(
      (expense) => !expense.linkToInvoice || expense.idInvoice === 0,
    );

    const invoices = await this.repository.loadInvoices(job.clientId, period.start, period.end);
    const invoiceSummaries = await Promise.all(
      invoices.map(async (invoice) => {
        const relatedExpenses = await this.repository.loadExpensesByInvoice(job.clientId, invoice.id);
        invoice.expenses = relatedExpenses;
        invoice.value = relatedExpenses.reduce((acc, expense) => acc + Number(expense.value), 0);
        return {
          invoice,
          expenses: relatedExpenses,
          totalValue: invoice.value,
        } satisfies UpcomingInvoiceSummary;
      }),
    );

    if (invoiceSummaries.length === 0 && expensesWithoutInvoice.length === 0) {
      this.logger.debug(
        `Nenhuma despesa encontrada para o cliente ${job.clientId} no período ${period.start} a ${period.end}`,
      );
    }

    return {
      period,
      expensesWithoutInvoice,
      invoices: invoiceSummaries,
    };
  }
}
