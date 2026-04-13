import { Module } from '@nestjs/common';
import { RedisModule } from 'src/modules/redis/redis.module';
import { REDIS_CONNECTION } from 'src/modules/redis/redis.tokens';
import { APPOINTMENTS_QUEUE_TOKEN } from 'src/modules/appointments/appointments.constants';
import { createQueue } from 'src/modules/appointments/queue.provider';
import type { Redis } from 'ioredis';
import { BankBalanceBuilder } from './builders/bank-balance.builder';
import { ChargeCanceledBuilder } from './builders/charge-canceled.builder';
import { ChargeExpiredBuilder } from './builders/charge-expired.builder';
import { ChargeGeneratedBuilder } from './builders/charge-generated.builder';
import { ChargePaidBuilder } from './builders/charge-paid.builder';
import { PendingExpensesBuilder } from './builders/pending-expenses.builder';
import { PendingRevenuesBuilder } from './builders/pending-revenues.builder';
import { LedgerBuildController } from './ledger-build.controller';
import { LedgerBuildRepository } from './ledger-build.repository';
import { LedgerBuildService } from './ledger-build.service';

@Module({
    imports: [RedisModule],
    providers: [
        {
            provide: APPOINTMENTS_QUEUE_TOKEN,
            useFactory: (redis: Redis) => createQueue(redis),
            inject: [REDIS_CONNECTION],
        },
        LedgerBuildService,
        LedgerBuildRepository,
        BankBalanceBuilder,
        ChargeGeneratedBuilder,
        ChargePaidBuilder,
        ChargeCanceledBuilder,
        ChargeExpiredBuilder,
        PendingExpensesBuilder,
        PendingRevenuesBuilder,
    ],
    controllers: [LedgerBuildController],
    exports: [LedgerBuildService, LedgerBuildRepository],
})
export class LedgerBuildModule {}
