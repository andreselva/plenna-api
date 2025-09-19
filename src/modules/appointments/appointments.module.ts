import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsQueueService } from './appointments-queue.service';
import { APPOINTMENTS_QUEUE_TOKEN, AVAILABLE_APPOINTMENTS_TOKEN } from './appointments.constants';
import { AppointmentsWorkerService } from './appointments-worker.service';
import { UpcomingExpensesService } from './services/upcoming-expenses.service';
import { UpcomingExpensesEmailService } from './services/upcoming-expenses-email.service';
import { UpcomingExpensesEmailAppointment } from './definitions/upcoming-expenses-email.appointment';
import { createQueue } from './queue.provider';
import { AppointmentsDebugController } from './debug/appointments.debug.controller';
import { AppointmentsBootstrapService } from './startup/appointments-bootstrap.service';

@Module({
  providers: [
    AppointmentsService,
    AppointmentsQueueService,
    AppointmentsWorkerService,
    UpcomingExpensesService,
    UpcomingExpensesEmailService,
    UpcomingExpensesEmailAppointment,
    AppointmentsBootstrapService,
    {
      provide: APPOINTMENTS_QUEUE_TOKEN,
      useFactory: () => createQueue(),
    },
    {
      provide: AVAILABLE_APPOINTMENTS_TOKEN,
      useFactory: (upcomingExpenses: UpcomingExpensesEmailAppointment) => [upcomingExpenses],
      inject: [UpcomingExpensesEmailAppointment],
    },
  ],
  controllers: [
    AppointmentsController,
    AppointmentsDebugController,
  ],
})
export class AppointmentsModule {}
