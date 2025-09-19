import { Module } from '@nestjs/common';
import { AppointmentsService, APPOINTMENTS_TOKEN } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsScheduler } from './services/appointments-scheduler.service';
import { AppointmentsFinanceRepository } from './repositories/appointments-finance.repository';
import { EmailNotificationService } from './services/email-notification.service';
import { UpcomingExpensesEmailService } from './services/upcoming-expenses-email.service';
import { UpcomingExpensesEmailAppointment } from './tasks/upcoming-expenses-email.appointment';

@Module({
  providers: [
    AppointmentsService,
    AppointmentsScheduler,
    AppointmentsFinanceRepository,
    EmailNotificationService,
    UpcomingExpensesEmailService,
    UpcomingExpensesEmailAppointment,
    {
      provide: APPOINTMENTS_TOKEN,
      useFactory: (upcomingExpensesEmailAppointment: UpcomingExpensesEmailAppointment) => [
        upcomingExpensesEmailAppointment,
      ],
      inject: [UpcomingExpensesEmailAppointment],
    },
  ],
  controllers: [AppointmentsController]
})
export class AppointmentsModule {}
