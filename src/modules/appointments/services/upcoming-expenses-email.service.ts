import { Injectable, Logger } from '@nestjs/common';
import DateHelper from 'src/Shared/Utils/DateHelper';
import { UpcomingExpensesSummary } from './upcoming-expenses.service';
import { EmailService } from 'src/modules/email/email.service';

@Injectable()
export class UpcomingExpensesEmailService {
  private readonly logger = new Logger(UpcomingExpensesEmailService.name);

  constructor(private readonly email: EmailService) {}

  async send(clientId: number, summary: UpcomingExpensesSummary, to: string): Promise<void> {
    if (summary.expensesWithoutInvoice.length === 0 && summary.invoices.length === 0) {
      this.logger.log(
        `Cliente ${clientId} não possui contas para o período ${summary.period.start} - ${summary.period.end}.`,
      );
      return;
    }

    const subject = `Contas a vencer nos próximos ${summary.period.days} dias`;

    await this.email.enqueueTemplate({
      to,
      subject,
      template: 'upcoming-expenses',
      context: { summary },
    });

    this.logger.log(`E-mail enfileirado para cliente ${clientId}: ${subject}`);
  }


  private composeBody(summary: UpcomingExpensesSummary): string {
    const lines: string[] = [];
    lines.push(`Período analisado: ${summary.period.start} até ${summary.period.end}`);
    lines.push('');

    if (summary.expensesWithoutInvoice.length > 0) {
      lines.push('Contas sem fatura vinculada:');
      summary.expensesWithoutInvoice.forEach((expense) => {
        const dueDate = DateHelper.toBrazilianDate(expense.invoiceDueDate) ?? expense.invoiceDueDate;
        lines.push(`- ${expense.name} | Vencimento: ${dueDate} | Valor: ${this.formatCurrency(expense.value)}`);
      });
      lines.push('');
    } else {
      lines.push('Nenhuma conta avulsa encontrada no período.');
      lines.push('');
    }

    if (summary.invoices.length > 0) {
      lines.push('Faturas:');
      summary.invoices.forEach(({ invoice, expenses }) => {
        const dueDate = DateHelper.toBrazilianDate(invoice.dueDate) ?? invoice.dueDate;
        lines.push(
          `- ${invoice.name} | Vencimento: ${dueDate} | Total: ${this.formatCurrency(invoice.value)}`,
        );
        if (expenses.length > 0) {
          expenses.forEach((expense) => {
            lines.push(
              `  • ${expense.name} | Valor: ${this.formatCurrency(expense.value)} | Status: ${expense.status}`,
            );
          });
        }
      });
    } else {
      lines.push('Nenhuma fatura com vencimento próximo encontrada.');
    }

    return lines.join('\n');
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(Number(value));
  }
}
