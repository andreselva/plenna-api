import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { RedisModule } from '../redis/redis.module';
import { REDIS_CONNECTION } from '../redis/redis.tokens';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import AppointmentsRepository from './appointments.repository';
import { AppointmentsQueueService } from './appointments-queue.service';
import { APPOINTMENTS_QUEUE_TOKEN, AVAILABLE_APPOINTMENTS_TOKEN } from './appointments.constants';
import { UpcomingExpensesEmailService } from './services/upcoming-expenses-email.service';
import { AppointmentSettingsService } from './services/appointment-settings.service';
import { createQueue } from './queue.provider';
import { AppointmentsDebugController } from './debug/appointments.debug.controller';
import { UpcomingExpensesService } from './services/upcoming-expenses.service';
import type { Redis } from 'ioredis';
import { UpcomingExpensesEmailAppointment } from './definitions/upcoming-expenses-email.appointment';
import { ChargesModule } from '../billing/charges/charges.module';
import { ChargeExpirationAppointment } from './definitions/charge-expiration.appointment';
import { LedgerModule } from '../Finance/core/ledger/ledger.module';
import { LedgerSnapshotAppointment } from './definitions/ledger-snapshot.appointment';
import { LedgerBuildModule } from '../Finance/core/ledger-build/ledger-build.module';
import { LedgerBuildAppointment } from './definitions/ledger-build.appointment';
import { LedgerMonthlyBuildModule } from '../Finance/core/ledger-monthly-build/ledger-monthly-build.module';
import { LedgerMonthlyBuildAppointment } from './definitions/ledger-monthly-build.appointment';

@Module({
  imports: [EmailModule, RedisModule, ChargesModule, LedgerModule, LedgerBuildModule, LedgerMonthlyBuildModule],
  providers: [
    AppointmentsService,
    AppointmentsQueueService,
    UpcomingExpensesService,
    UpcomingExpensesEmailService,
    UpcomingExpensesEmailAppointment,
    ChargeExpirationAppointment,
    LedgerSnapshotAppointment,
    LedgerBuildAppointment,
    LedgerMonthlyBuildAppointment,
    AppointmentSettingsService,
    AppointmentsRepository,
    {
      provide: APPOINTMENTS_QUEUE_TOKEN,
      useFactory: (redis: Redis) => createQueue(redis),
      inject: [REDIS_CONNECTION],
    },
    {
      provide: AVAILABLE_APPOINTMENTS_TOKEN,
      useFactory: (
        upcomingExpenses: UpcomingExpensesEmailAppointment,
        chargeExpiration: ChargeExpirationAppointment,
        ledgerSnapshot: LedgerSnapshotAppointment,
        ledgerBuild: LedgerBuildAppointment,
        ledgerMonthlyBuild: LedgerMonthlyBuildAppointment,
      ) => [upcomingExpenses, chargeExpiration, ledgerSnapshot, ledgerBuild, ledgerMonthlyBuild],
      inject: [UpcomingExpensesEmailAppointment, ChargeExpirationAppointment, LedgerSnapshotAppointment, LedgerBuildAppointment, LedgerMonthlyBuildAppointment],
    },
  ],
  controllers: [
    AppointmentsController,
    AppointmentsDebugController,
  ],
  exports: [
    AVAILABLE_APPOINTMENTS_TOKEN,
    AppointmentsQueueService,
    LedgerSnapshotAppointment,
    LedgerBuildAppointment,
    LedgerMonthlyBuildAppointment,
  ]
})
export class AppointmentsModule {}
