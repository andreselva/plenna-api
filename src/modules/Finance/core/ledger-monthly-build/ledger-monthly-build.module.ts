import { Module } from '@nestjs/common';
import { RedisModule } from 'src/modules/redis/redis.module';
import { MonthlyEventBuilder } from './builders/monthly-event.builder';
import { MonthlyPendingExpensesBuilder } from './builders/monthly-pending-expenses.builder';
import { MonthlyPendingRevenuesBuilder } from './builders/monthly-pending-revenues.builder';
import { LedgerMonthlyBuildController } from './ledger-monthly-build.controller';
import { LedgerMonthlyBuildRepository } from './ledger-monthly-build.repository';
import { LedgerMonthlyBuildService } from './ledger-monthly-build.service';

@Module({
    imports: [RedisModule],
    providers: [
        LedgerMonthlyBuildService,
        LedgerMonthlyBuildRepository,
        MonthlyEventBuilder,
        MonthlyPendingExpensesBuilder,
        MonthlyPendingRevenuesBuilder,
    ],
    controllers: [LedgerMonthlyBuildController],
    exports: [LedgerMonthlyBuildService, LedgerMonthlyBuildRepository],
})
export class LedgerMonthlyBuildModule {}
