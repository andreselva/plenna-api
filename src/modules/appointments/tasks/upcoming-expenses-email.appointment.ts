import { Injectable } from "@nestjs/common";
import { AppointmentBase } from "../appointment.base";
import { Recurrence } from "src/enum/recurrence.enum";
import { AppointmentExecutionContext } from "../interfaces/appointment-execution-context.interface";
import { UpcomingExpensesEmailService } from "../services/upcoming-expenses-email.service";

@Injectable()
export class UpcomingExpensesEmailAppointment extends AppointmentBase {
  constructor(private readonly upcomingExpensesEmailService: UpcomingExpensesEmailService) {
    super(
      1,
      'Envio de e-mail para contas com vencimento próximo',
      'Notifica clientes/usuários sobre vencimentos próximos.',
      Recurrence.DAILY_08,
      false,
      'appointments.email.upcoming-expenses',
      null,
      'America/Sao_Paulo',
    );
  }

  async execute(context: AppointmentExecutionContext): Promise<void> {
    await this.upcomingExpensesEmailService.process(context.clientId);
  }
}
