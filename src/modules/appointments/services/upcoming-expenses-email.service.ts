import { Injectable, Logger } from '@nestjs/common';
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
}
