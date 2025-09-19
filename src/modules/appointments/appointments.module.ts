import { Module } from '@nestjs/common';
import { Queue } from 'bullmq';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsQueueService } from './appointments-queue.service';
import { APPOINTMENTS_QUEUE_NAME, APPOINTMENTS_QUEUE_TOKEN, AVAILABLE_APPOINTMENTS_TOKEN } from './appointments.constants';
import { AppointmentsWorkerService } from './appointments-worker.service';
import { UpcomingExpensesService } from './services/upcoming-expenses.service';
import { UpcomingExpensesEmailService } from './services/upcoming-expenses-email.service';
import { UpcomingExpensesEmailAppointment } from './definitions/upcoming-expenses-email.appointment';

@Module({
  providers: [
    AppointmentsService,
    AppointmentsQueueService,
    AppointmentsWorkerService,
    UpcomingExpensesService,
    UpcomingExpensesEmailService,
    UpcomingExpensesEmailAppointment,
    {
      provide: APPOINTMENTS_QUEUE_TOKEN,
      useFactory: () => Queue.get(APPOINTMENTS_QUEUE_NAME),
    },
    {
      provide: AVAILABLE_APPOINTMENTS_TOKEN,
      useFactory: (upcomingExpenses: UpcomingExpensesEmailAppointment) => [upcomingExpenses],
      inject: [UpcomingExpensesEmailAppointment],
    },
  ],
  controllers: [AppointmentsController]
})
export class AppointmentsModule {}
