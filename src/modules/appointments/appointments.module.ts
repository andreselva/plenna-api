import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsQueueService } from './appointments-queue.service';
import { APPOINTMENTS_QUEUE_TOKEN, AVAILABLE_APPOINTMENTS_TOKEN } from './appointments.constants';
import { UpcomingExpensesEmailService } from './services/upcoming-expenses-email.service';
import { UpcomingExpensesEmailAppointment } from './definitions/upcoming-expenses-email.appointment';
import { AppointmentSettingsService } from './services/appointment-settings.service';
import { createQueue } from './queue.provider';
import { AppointmentsDebugController } from './debug/appointments.debug.controller';
import { UpcomingExpensesService } from './services/upcoming-expenses.service';
import AppointmentsRepository from './appointments.repository';
import { EmailModule } from '../email/email.module';
import { RedisModule } from '../redis/redis.module';
import type { Redis } from 'ioredis';
import { REDIS_CONNECTION } from '../redis/redis.tokens';

@Module({
  imports: [EmailModule, RedisModule],
  providers: [
    AppointmentsService,
    AppointmentsQueueService,
    UpcomingExpensesService,
    UpcomingExpensesEmailService,
    UpcomingExpensesEmailAppointment,
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
  ],
  controllers: [
    AppointmentsController,
    AppointmentsDebugController,
  ],
  exports: [
    AVAILABLE_APPOINTMENTS_TOKEN
  ]
})
export class AppointmentsModule {}
