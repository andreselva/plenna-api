import { Module } from '@nestjs/common';
import { MonthlyEventBuilder } from './builders/monthly-event.builder';
import { MonthlyPendingExpensesBuilder } from './builders/monthly-pending-expenses.builder';
import { MonthlyPendingRevenuesBuilder } from './builders/monthly-pending-revenues.builder';
import { LedgerMonthlyBuildRepository } from './ledger-monthly-build.repository';
import { LedgerMonthlyBuildService } from './ledger-monthly-build.service';

@Module({
    providers: [
        LedgerMonthlyBuildService,
        LedgerMonthlyBuildRepository,
        MonthlyEventBuilder,
        MonthlyPendingExpensesBuilder,
        MonthlyPendingRevenuesBuilder,
    ],
    exports: [LedgerMonthlyBuildService, LedgerMonthlyBuildRepository],
})
export class LedgerMonthlyBuildModule {}
