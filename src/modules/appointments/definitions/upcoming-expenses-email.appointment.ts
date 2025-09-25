import { Injectable, Logger } from '@nestjs/common';
import { Recurrence } from 'src/enum/recurrence.enum';
import { ExecutableAppointment } from '../executable-appointment.base';
import { UpcomingExpensesEmailService } from '../services/upcoming-expenses-email.service';
import { AppointmentJobData } from '../types/appointment-job-data.type';
import { UpcomingExpensesService } from '../services/upcoming-expenses.service';
import AppointmentsRepository from '../appointments.repository';

export interface UpcomingExpensesEmailConfig {
  days?: number;
}

@Injectable()
export class UpcomingExpensesEmailAppointment extends ExecutableAppointment<UpcomingExpensesEmailConfig> {
  private readonly logger = new Logger(UpcomingExpensesEmailAppointment.name);

  constructor(
    private readonly summaryService: UpcomingExpensesService,
    private readonly emailService: UpcomingExpensesEmailService,
    private readonly repository: AppointmentsRepository
  ) {
    super(
      1,
      'Envio de e-mail para contas com vencimento próximo',
      'Notifica clientes sobre contas e faturas próximas ao vencimento.',
      Recurrence.DAILY_08,
      false,
      'upcoming-expenses-email',
      null,
      'America/Sao_Paulo',
    );
  }

  async execute(job: AppointmentJobData<UpcomingExpensesEmailConfig>): Promise<void> {
    this.logger.debug(`Processando agendamento ${this.type} para o cliente ${job.clientId}`);
    const timezone = job.timezone ?? this.timezone ?? 'America/Sao_Paulo';
    const summary = await this.summaryService.getSummary(job, timezone);
    const users = await this.repository.loadUsers();

    await Promise.all(
      users.map((user) => this.emailService.send(job.clientId, summary, user.email)),
    );
  }
}
