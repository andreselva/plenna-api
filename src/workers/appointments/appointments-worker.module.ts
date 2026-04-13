import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from 'src/modules/Config/Database/database.module';
import { RedisModule } from 'src/modules/redis/redis.module';
import { AppointmentsModule } from 'src/modules/appointments/appointments.module';
import { LedgerModule } from 'src/modules/Finance/core/ledger/ledger.module';
import { LedgerMonthlyBuildModule } from 'src/modules/Finance/core/ledger-monthly-build/ledger-monthly-build.module';
import { WorkerAuthModule } from '../worker-auth.module';
import { AppointmentsWorkerService } from './appointments-worker.service';
import { WorkerFactory } from '../worker.factory';
import { LedgerSnapshotInitializer } from './ledger-snapshot.initializer';
import { LedgerMonthlyBuildInitializer } from './ledger-monthly-build.initializer';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WorkerAuthModule,
    DatabaseModule,
    RedisModule,
    AppointmentsModule,
    LedgerModule,
    LedgerMonthlyBuildModule,
  ],
  providers: [AppointmentsWorkerService, WorkerFactory, LedgerSnapshotInitializer, LedgerMonthlyBuildInitializer],
})
export class AppointmentsWorkerModule {}
