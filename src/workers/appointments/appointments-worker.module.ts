import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from 'src/modules/Config/Database/database.module';
import { RedisModule } from 'src/modules/redis/redis.module';
import { AppointmentsModule } from 'src/modules/appointments/appointments.module';
import { LedgerModule } from 'src/modules/Finance/core/ledger/ledger.module';
import { WorkerAuthModule } from '../worker-auth.module';
import { AppointmentsWorkerService } from './appointments-worker.service';
import { WorkerFactory } from '../worker.factory';
import { LedgerSnapshotInitializer } from './ledger-snapshot.initializer';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WorkerAuthModule,
    DatabaseModule,
    RedisModule,
    AppointmentsModule,
    LedgerModule,
  ],
  providers: [AppointmentsWorkerService, WorkerFactory, LedgerSnapshotInitializer],
})
export class AppointmentsWorkerModule {}