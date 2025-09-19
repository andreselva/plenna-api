import { Injectable, Logger } from "@nestjs/common";
import { UpcomingExpensesEmailPayload } from "./upcoming-expenses-email.service";

@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);

  async sendUpcomingExpensesEmail(payload: UpcomingExpensesEmailPayload): Promise<void> {
    this.logger.log(
      `Enviando e-mail de contas próximas para ${payload.client.email} contendo ${payload.expenses.length} despesas e ${payload.invoices.length} faturas.`,
    );
    this.logger.debug(JSON.stringify(payload));
  }
}
