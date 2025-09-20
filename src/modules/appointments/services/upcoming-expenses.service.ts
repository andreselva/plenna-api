import { Injectable, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';
import { Expense } from 'src/EntityModels/Expense';
import Invoice from 'src/EntityModels/invoice';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';
import DataMapper from 'src/Shared/mapper/DataMapper';
import { AppointmentJobData } from '../types/appointment-job-data.type';

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

  constructor(private readonly database: MySQLDatabase) {}

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

    const expenses = await this.loadExpenses(job.clientId, period.start, period.end);
    const expensesWithoutInvoice = expenses.filter(
      (expense) => !expense.linkToInvoice || expense.idInvoice === 0,
    );

    const invoices = await this.loadInvoices(job.clientId, period.start, period.end);
    const invoiceSummaries = await Promise.all(
      invoices.map(async (invoice) => {
        const relatedExpenses = await this.loadExpensesByInvoice(job.clientId, invoice.id);
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

  private async loadExpenses(clientId: number, start: string, end: string): Promise<Expense[]> {
    const query = `SELECT * FROM expense WHERE clientId = ? AND invoiceDueDate >= ? AND invoiceDueDate <= ? AND status = 'pending'`;
    const rows = await this.database.select(query, [clientId, start, end]);
    return DataMapper.toEntities(rows, Expense).map((expense) => Expense.fromEntity(expense));
  }

  private async loadInvoices(clientId: number, start: string, end: string): Promise<Invoice[]> {
    const query = `SELECT * FROM invoices WHERE clientId = ? AND dueDate >= ? AND dueDate <= ? AND status = 'pending'`;
    const rows = await this.database.select(query, [clientId, start, end]);
    return DataMapper.toEntities(rows, Invoice).map((invoice) => Object.assign(new Invoice(), invoice));
  }

  private async loadExpensesByInvoice(clientId: number, invoiceId: number): Promise<Expense[]> {
    const query = 'SELECT * FROM expense WHERE clientId = ? AND idInvoice = ?';
    const rows = await this.database.select(query, [clientId, invoiceId]);
    return DataMapper.toEntities(rows, Expense).map((expense) => Expense.fromEntity(expense));
  }
}
