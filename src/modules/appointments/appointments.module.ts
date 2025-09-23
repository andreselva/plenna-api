import { Module } from '@nestjs/common';
import { APP_BOOTSTRAP_LISTENER } from '@nestjs/core';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsQueueService } from './appointments-queue.service';
import { APPOINTMENTS_QUEUE_TOKEN, AVAILABLE_APPOINTMENTS_TOKEN } from './appointments.constants';
import { AppointmentsWorkerService } from './appointments-worker.service';
import { UpcomingExpensesEmailService } from './services/upcoming-expenses-email.service';
import { UpcomingExpensesEmailAppointment } from './definitions/upcoming-expenses-email.appointment';
import { AppointmentSettingsService } from './services/appointment-settings.service';
import { createQueue } from './queue.provider';
import { AppointmentsDebugController } from './debug/appointments.debug.controller';
import { AppointmentsBootstrapService } from './startup/appointments-bootstrap.service';
import { UpcomingExpensesService } from './services/upcoming-expenses.service';
import AppointmentsRepository from './appointments.repository';
import { EmailModule } from '../email/email.module';
import { RedisModule, REDIS_CONNECTION } from '../redis/redis.module';
import type { Redis } from 'ioredis';

@Module({
  imports: [EmailModule, RedisModule],
  providers: [
    AppointmentsService,
    AppointmentsQueueService,
    AppointmentsWorkerService,
    UpcomingExpensesService,
    UpcomingExpensesEmailService,
    UpcomingExpensesEmailAppointment,
    AppointmentsBootstrapService,
    AppointmentSettingsService,
    AppointmentsRepository,
    {
      provide: APPOINTMENTS_QUEUE_TOKEN,
      useFactory: (redis: Redis) => createQueue(redis),
      inject: [REDIS_CONNECTION],
    },
    {
      provide: AVAILABLE_APPOINTMENTS_TOKEN,
      useFactory: (upcomingExpenses: UpcomingExpensesEmailAppointment) => [upcomingExpenses],
      inject: [UpcomingExpensesEmailAppointment],
    },
    {
      provide: APP_BOOTSTRAP_LISTENER,
      multi: true,
      inject: [AppointmentsWorkerService],
      useFactory: (worker: AppointmentsWorkerService) => async () => {
        await worker.ensureInitialized();
      },
    },
  ],
  controllers: [
    AppointmentsController,
    AppointmentsDebugController,
  ],
})
export class AppointmentsModule {}
