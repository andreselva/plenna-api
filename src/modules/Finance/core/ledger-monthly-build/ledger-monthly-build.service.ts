import { Injectable, Logger } from '@nestjs/common';
import { LedgerMonthlyBuild } from 'src/EntityModels/ledger-monthly-build';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import { FinancialEventsEnum } from 'src/enum/financial-events.enum';
import { DateTime } from 'luxon';
import DateHelper from 'src/Shared/Utils/DateHelper';
import RedisService from 'src/modules/redis/redis-service';
import { RedisKeys } from 'src/modules/redis/redis.keys';
import { MonthlyEventBuilder } from './builders/monthly-event.builder';
import { MonthlyPendingExpensesBuilder } from './builders/monthly-pending-expenses.builder';
import { MonthlyPendingRevenuesBuilder } from './builders/monthly-pending-revenues.builder';
import { LedgerMonthlyBuildRepository } from './ledger-monthly-build.repository';

const TIMEZONE = 'America/Sao_Paulo';

@Injectable()
export class LedgerMonthlyBuildService {
    private readonly logger = new Logger(LedgerMonthlyBuildService.name);

    constructor(
        private readonly repository: LedgerMonthlyBuildRepository,
        private readonly authContext: AuthContextService,
        private readonly redisService: RedisService,
        private readonly monthlyEventBuilder: MonthlyEventBuilder,
        private readonly pendingExpensesBuilder: MonthlyPendingExpensesBuilder,
        private readonly pendingRevenuesBuilder: MonthlyPendingRevenuesBuilder,
    ) {}

    async build(): Promise<void> {
        const clientId = this.authContext.getClientId();
        this.logger.log(`Iniciando monthly build para cliente ${clientId}`);

        const now = DateTime.local().setZone(TIMEZONE);
        const period = now.toFormat('yyyy-MM');
        const periodStart = now.startOf('month').toFormat('yyyy-MM-dd HH:mm:ss');
        const periodEnd = now.endOf('month').toFormat('yyyy-MM-dd HH:mm:ss');

        const [
            paymentPosted,
            transferPosted,
            transferReceived,
            reversal,
            openingBalance,
            revenueReceived,
            chargeGenerated,
            chargePaid,
            chargeCanceled,
            chargeExpired,
            chargeRefunded,
            revenueRecognized,
            expenseRecognized,
            pendingExpenses,
            pendingRevenues,
            openCharges,
            currentLiquidBalance,
        ] = await Promise.all([
            this.monthlyEventBuilder.build(FinancialEventsEnum.PAYMENT_POSTED, periodStart, periodEnd),
            this.monthlyEventBuilder.build(FinancialEventsEnum.TRANSFER_POSTED, periodStart, periodEnd),
            this.monthlyEventBuilder.build(FinancialEventsEnum.TRANSFER_RECEIVED, periodStart, periodEnd),
            this.monthlyEventBuilder.build(FinancialEventsEnum.REVERSAL, periodStart, periodEnd),
            this.monthlyEventBuilder.build(FinancialEventsEnum.OPENING_BALANCE, periodStart, periodEnd),
            this.monthlyEventBuilder.build(FinancialEventsEnum.REVENUE_RECEIVED, periodStart, periodEnd),
            this.monthlyEventBuilder.build(FinancialEventsEnum.CHARGE_GENERATED, periodStart, periodEnd),
            this.monthlyEventBuilder.build(FinancialEventsEnum.CHARGE_PAID, periodStart, periodEnd),
            this.monthlyEventBuilder.build(FinancialEventsEnum.CHARGE_CANCELED, periodStart, periodEnd),
            this.monthlyEventBuilder.build(FinancialEventsEnum.CHARGE_EXPIRED, periodStart, periodEnd),
            this.monthlyEventBuilder.build(FinancialEventsEnum.CHARGE_REFUNDED, periodStart, periodEnd),
            this.monthlyEventBuilder.build(FinancialEventsEnum.REVENUE_RECOGNIZED, periodStart, periodEnd),
            this.monthlyEventBuilder.build(FinancialEventsEnum.EXPENSE_RECOGNIZED, periodStart, periodEnd),
            this.pendingExpensesBuilder.build(),
            this.pendingRevenuesBuilder.build(),
            this.repository.getOpenChargesSnapshot(),
            this.repository.getCurrentLiquidBalance(),
        ]);

        await this.repository.closePreviousPeriod(period, currentLiquidBalance);

        const build = new LedgerMonthlyBuild();
        build.period = period;
        build.builtAt = DateHelper.getCurrentDate();
        build.openChargesCount = openCharges.openChargesCount;
        build.openChargesValue = openCharges.openChargesValue;
        build.pendingExpenses = pendingExpenses.totalValue;
        build.pendingRevenues = pendingRevenues.totalValue;
        build.buildData = {
            events: {
                paymentPosted,
                transferPosted,
                transferReceived,
                reversal,
                openingBalance,
                revenueReceived,
                chargeGenerated,
                chargePaid,
                chargeCanceled,
                chargeExpired,
                chargeRefunded,
                revenueRecognized,
                expenseRecognized,
            },
        };

        await this.repository.upsert(build);
        await this.redisService.delete(RedisKeys.ledgerMonthlyBuild(clientId, period));
        this.logger.log(`Monthly build concluído para cliente ${clientId} — período ${period}`);
    }

    async getByPeriod(period: string): Promise<LedgerMonthlyBuild | null> {
        const clientId = this.authContext.getClientId();
        const cacheKey = RedisKeys.ledgerMonthlyBuild(clientId, period);

        const cached = await this.redisService.get<LedgerMonthlyBuild>(cacheKey);
        if (cached) return cached;

        const build = await this.repository.getByPeriod(period);
        if (build) {
            const ttl = build.closedAt ? 12 * 60 * 60 : 5 * 60;
            await this.redisService.set(cacheKey, build, ttl);
        }
        return build;
    }

    async listPeriods(limit: number = 12): Promise<LedgerMonthlyBuild[]> {
        return this.repository.listPeriods(limit);
    }
}
