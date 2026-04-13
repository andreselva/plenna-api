import { Inject, Injectable, Logger } from '@nestjs/common';
import { LedgerBuild } from 'src/EntityModels/ledger-build';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import { APPOINTMENTS_QUEUE_TOKEN } from 'src/modules/appointments/appointments.constants';
import { Queue } from 'src/modules/appointments/queue.provider';
import { AppointmentJobData } from 'src/modules/appointments/types/appointment-job-data.type';
import RedisService from 'src/modules/redis/redis-service';
import { RedisKeys } from 'src/modules/redis/redis.keys';
import DateHelper from 'src/Shared/Utils/DateHelper';
import { BankBalanceBuilder } from './builders/bank-balance.builder';
import { ChargeCanceledBuilder } from './builders/charge-canceled.builder';
import { ChargeExpiredBuilder } from './builders/charge-expired.builder';
import { ChargeGeneratedBuilder } from './builders/charge-generated.builder';
import { ChargePaidBuilder } from './builders/charge-paid.builder';
import { PendingExpensesBuilder } from './builders/pending-expenses.builder';
import { PendingRevenuesBuilder } from './builders/pending-revenues.builder';
import { LedgerBuildRepository } from './ledger-build.repository';

const REBUILD_DELAY_MS = 2 * 60 * 1000;
const LEDGER_BUILD_APPOINTMENT_ID = 4;

@Injectable()
export class LedgerBuildService {
    private readonly logger = new Logger(LedgerBuildService.name);

    constructor(
        private readonly repository: LedgerBuildRepository,
        private readonly authContext: AuthContextService,
        private readonly redisService: RedisService,
        @Inject(APPOINTMENTS_QUEUE_TOKEN)
        private readonly queue: Queue<AppointmentJobData>,
        private readonly bankBalanceBuilder: BankBalanceBuilder,
        private readonly chargeGeneratedBuilder: ChargeGeneratedBuilder,
        private readonly chargePaidBuilder: ChargePaidBuilder,
        private readonly chargeCanceledBuilder: ChargeCanceledBuilder,
        private readonly chargeExpiredBuilder: ChargeExpiredBuilder,
        private readonly pendingExpensesBuilder: PendingExpensesBuilder,
        private readonly pendingRevenuesBuilder: PendingRevenuesBuilder,
    ) {}

    async build(): Promise<void> {
        const clientId = this.authContext.getClientId();
        this.logger.log(`Iniciando ledger build para cliente ${clientId}`);

        const [
            bankBalance,
            chargeGenerated,
            chargePaid,
            chargeCanceled,
            chargeExpired,
            pendingExpenses,
            pendingRevenues,
        ] = await Promise.all([
            this.bankBalanceBuilder.build(),
            this.chargeGeneratedBuilder.build(),
            this.chargePaidBuilder.build(),
            this.chargeCanceledBuilder.build(),
            this.chargeExpiredBuilder.build(),
            this.pendingExpensesBuilder.build(),
            this.pendingRevenuesBuilder.build(),
        ]);

        const openChargesCount = Math.max(
            0,
            chargeGenerated.count - chargePaid.count - chargeCanceled.count - chargeExpired.count,
        );
        const openChargesValue = Math.max(
            0,
            chargeGenerated.totalAmount - chargePaid.totalAmount - chargeCanceled.totalAmount - chargeExpired.totalAmount,
        );

        const build = new LedgerBuild();
        build.builtAt = DateHelper.getCurrentDate();
        build.totalLiquidBalance = bankBalance.totalLiquidBalance;
        build.openChargesCount = openChargesCount;
        build.openChargesValue = openChargesValue;
        build.pendingExpensesCount = pendingExpenses.count;
        build.pendingExpensesValue = pendingExpenses.totalValue;
        build.pendingRevenuesCount = pendingRevenues.count;
        build.pendingRevenuesValue = pendingRevenues.totalValue;
        build.buildData = {
            bankBalance,
            pending: {
                expenses: pendingExpenses,
                revenues: pendingRevenues,
            },
        };

        await this.repository.save(build, true);
        await this.redisService.delete(RedisKeys.ledgerBuildLatest(clientId));
        this.logger.log(`Ledger build concluído para cliente ${clientId}`);
    }

    async getLatest(): Promise<LedgerBuild | null> {
        const clientId = this.authContext.getClientId();
        const cacheKey = RedisKeys.ledgerBuildLatest(clientId);

        const cached = await this.redisService.get<LedgerBuild>(cacheKey);
        if (cached) return cached;

        const build = await this.repository.getLatestBuild();
        if (build) {
            await this.redisService.set(cacheKey, build, 5 * 60);
        }
        return build;
    }

    async scheduleRebuild(): Promise<void> {
        const clientId = this.authContext.getClientId();
        const jobId = `ledger-build:rebuild:${clientId}`;

        const payload: AppointmentJobData = {
            appointmentId: LEDGER_BUILD_APPOINTMENT_ID,
            clientId,
            config: null,
        };

        await this.queue.add('ledger-build', payload, {
            jobId,
            delay: REBUILD_DELAY_MS,
            removeOnComplete: true,
        });

        this.logger.log(`Rebuild agendado para cliente ${clientId} (delay=2min, jobId=${jobId})`);
    }
}
