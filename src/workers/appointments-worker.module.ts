import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EmailModule } from 'src/modules/email/email.module';
import { RedisModule } from 'src/modules/redis/redis.module';

import { AppointmentSettingsService } from 'src/modules/appointments/services/appointment-settings.service';
import { UpcomingExpensesService } from 'src/modules/appointments/services/upcoming-expenses.service';
import { UpcomingExpensesEmailService } from 'src/modules/appointments/services/upcoming-expenses-email.service';
import { UpcomingExpensesEmailAppointment } from 'src/modules/appointments/definitions/upcoming-expenses-email.appointment';
import AppointmentsRepository from 'src/modules/appointments/appointments.repository';

import { AVAILABLE_APPOINTMENTS_TOKEN } from 'src/modules/appointments/appointments.constants';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import { DatabaseModule } from 'src/modules/Config/Database/database.module';
import { AppointmentsModule } from 'src/modules/appointments/appointments.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: false }),
    DatabaseModule,
    EmailModule,
    RedisModule,
    AppointmentsModule
  ],
  providers: [
    {
      provide: AuthContextService,
      useValue: ((
        {
          getUser: () => ({ id: 0, username: 'worker', role: 'system', clientId: 0 }),
          getUserId: () => 0,
          getTenantId: () => 0,
          getRoles: () => ['system'],
          isAdmin: () => true,
          getContext: () => ({ userId: 0, tenantId: 0, roles: ['system'] }),
        }
      ) as unknown) as AuthContextService,
    },

    AppointmentSettingsService,
    UpcomingExpensesService,
    UpcomingExpensesEmailService,
    AppointmentsRepository,
    UpcomingExpensesEmailAppointment,
    {
      provide: AVAILABLE_APPOINTMENTS_TOKEN,
      useFactory: (upcoming: UpcomingExpensesEmailAppointment) => [upcoming],
      inject: [UpcomingExpensesEmailAppointment],
    },
  ],
  exports: [
    AVAILABLE_APPOINTMENTS_TOKEN,
  ],
})
export class AppointmentsWorkerModule {}
