import { Module } from '@nestjs/common';
import { RedisModule } from 'src/modules/redis/redis.module';
import { REDIS_CONNECTION } from 'src/modules/redis/redis.tokens';
import { APPOINTMENTS_QUEUE_TOKEN } from 'src/modules/appointments/appointments.constants';
import { createQueue } from 'src/modules/appointments/queue.provider';
import type { Redis } from 'ioredis';
import { LedgerMonthlyBuildRepository } from './ledger-monthly-build.repository';
import { LedgerMonthlyBuildService } from './ledger-monthly-build.service';
import { LedgerMonthlyBuildController } from './ledger-monthly-build.controller';

@Module({
    imports: [RedisModule],
    providers: [
        {
            provide: APPOINTMENTS_QUEUE_TOKEN,
            useFactory: (redis: Redis) => createQueue(redis),
            inject: [REDIS_CONNECTION],
        },
        LedgerMonthlyBuildService,
        LedgerMonthlyBuildRepository,
    ],
    controllers: [LedgerMonthlyBuildController],
    exports: [LedgerMonthlyBuildService, LedgerMonthlyBuildRepository],
})
export class LedgerMonthlyBuildModule {}
