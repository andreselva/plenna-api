import { Inject, Injectable, Logger } from '@nestjs/common';
import { LedgerMonthlyBuild } from 'src/EntityModels/ledger-monthly-build';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import { FinancialEventsEnum } from 'src/enum/financial-events.enum';
import { APPOINTMENTS_QUEUE_TOKEN } from 'src/modules/appointments/appointments.constants';
import { Queue } from 'src/modules/appointments/queue.provider';
import { AppointmentJobData } from 'src/modules/appointments/types/appointment-job-data.type';
import { DateTime } from 'luxon';
import DateHelper from 'src/Shared/Utils/DateHelper';
import { LedgerMonthlyBuildRepository } from './ledger-monthly-build.repository';
import { EventSummaryResult, PendingItemsResult } from './types/build-result.type';

const TIMEZONE = 'America/Sao_Paulo';
const REBUILD_DELAY_MS = 2 * 60 * 1000;
const LEDGER_MONTHLY_BUILD_APPOINTMENT_ID = 5;

@Injectable()
export class LedgerMonthlyBuildService {
    private readonly logger = new Logger(LedgerMonthlyBuildService.name);

    constructor(
        private readonly repository: LedgerMonthlyBuildRepository,
        private readonly authContext: AuthContextService,
        @Inject(APPOINTMENTS_QUEUE_TOKEN)
        private readonly queue: Queue<AppointmentJobData>,
    ) {}

    async build(): Promise<void> {
        const clientId = this.authContext.getClientId();
        this.logger.log(`Iniciando monthly build para cliente ${clientId}`);

        const now = DateTime.local().setZone(TIMEZONE);
        const period: string = now.toFormat('yyyy-MM');
        const periodStart: string = now.startOf('month').toFormat('yyyy-MM-dd HH:mm:ss');
        const periodEnd: string = now.endOf('month').toFormat('yyyy-MM-dd HH:mm:ss');

        const [
            paymentPosted,
            transferPosted,
            transferReceived,
            reversal,
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
        ]: [
            EventSummaryResult,
            EventSummaryResult,
            EventSummaryResult,
            EventSummaryResult,
            EventSummaryResult,
            EventSummaryResult,
            EventSummaryResult,
            EventSummaryResult,
            EventSummaryResult,
            EventSummaryResult,
            EventSummaryResult,
            EventSummaryResult,
            PendingItemsResult,
            PendingItemsResult,
            { openChargesCount: number; openChargesValue: number },
            number,
        ] = await Promise.all([
            this.repository.getEventSummaryForPeriod(FinancialEventsEnum.PAYMENT_POSTED, periodStart, periodEnd),
            this.repository.getEventSummaryForPeriod(FinancialEventsEnum.TRANSFER_POSTED, periodStart, periodEnd),
            this.repository.getEventSummaryForPeriod(FinancialEventsEnum.TRANSFER_RECEIVED, periodStart, periodEnd),
            this.repository.getEventSummaryForPeriod(FinancialEventsEnum.REVERSAL, periodStart, periodEnd),
            this.repository.getEventSummaryForPeriod(FinancialEventsEnum.REVENUE_RECEIVED, periodStart, periodEnd),
            this.repository.getEventSummaryForPeriod(FinancialEventsEnum.CHARGE_GENERATED, periodStart, periodEnd),
            this.repository.getEventSummaryForPeriod(FinancialEventsEnum.CHARGE_PAID, periodStart, periodEnd),
            this.repository.getEventSummaryForPeriod(FinancialEventsEnum.CHARGE_CANCELED, periodStart, periodEnd),
            this.repository.getEventSummaryForPeriod(FinancialEventsEnum.CHARGE_EXPIRED, periodStart, periodEnd),
            this.repository.getEventSummaryForPeriod(FinancialEventsEnum.CHARGE_REFUNDED, periodStart, periodEnd),
            this.repository.getEventSummaryForPeriod(FinancialEventsEnum.REVENUE_RECOGNIZED, periodStart, periodEnd),
            this.repository.getEventSummaryForPeriod(FinancialEventsEnum.EXPENSE_RECOGNIZED, periodStart, periodEnd),
            this.repository.getPendingExpenses(),
            this.repository.getPendingRevenues(),
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
        this.logger.log(`Monthly build concluído para cliente ${clientId} — período ${period}`);
    }

    async scheduleRebuild(): Promise<void> {
        const clientId = this.authContext.getClientId();
        const jobId = `ledger-monthly-build:rebuild:${clientId}`;

        const payload: AppointmentJobData = {
            appointmentId: LEDGER_MONTHLY_BUILD_APPOINTMENT_ID,
            clientId,
            config: null,
        };

        await this.queue.add('ledger-monthly-build', payload, {
            jobId,
            delay: REBUILD_DELAY_MS,
            removeOnComplete: true,
        });

        this.logger.log(`Rebuild mensal agendado para cliente ${clientId} (delay=2min, jobId=${jobId})`);
    }
}
