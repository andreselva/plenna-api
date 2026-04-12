import { Inject, Injectable, Logger } from '@nestjs/common';
import { LedgerBuild } from 'src/EntityModels/ledger-build';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import { APPOINTMENTS_QUEUE_TOKEN } from 'src/modules/appointments/appointments.constants';
import { Queue } from 'src/modules/appointments/queue.provider';
import { AppointmentJobData } from 'src/modules/appointments/types/appointment-job-data.type';
import DateHelper from 'src/Shared/Utils/DateHelper';
import { BankBalanceBuilder } from './builders/bank-balance.builder';
import { ChargeCanceledBuilder } from './builders/charge-canceled.builder';
import { ChargeExpiredBuilder } from './builders/charge-expired.builder';
import { ChargeGeneratedBuilder } from './builders/charge-generated.builder';
import { ChargePaidBuilder } from './builders/charge-paid.builder';
import { ChargeRefundedBuilder } from './builders/charge-refunded.builder';
import { ExpenseRecognizedBuilder } from './builders/expense-recognized.builder';
import { OpeningBalanceBuilder } from './builders/opening-balance.builder';
import { PaymentPostedBuilder } from './builders/payment-posted.builder';
import { PendingExpensesBuilder } from './builders/pending-expenses.builder';
import { PendingRevenuesBuilder } from './builders/pending-revenues.builder';
import { RevenueReceivedBuilder } from './builders/revenue-received.builder';
import { RevenueRecognizedBuilder } from './builders/revenue-recognized.builder';
import { ReversalBuilder } from './builders/reversal.builder';
import { TransferPostedBuilder } from './builders/transfer-posted.builder';
import { TransferReceivedBuilder } from './builders/transfer-received.builder';
import { LedgerBuildRepository } from './ledger-build.repository';

const REBUILD_DELAY_MS = 2 * 60 * 1000;
const LEDGER_BUILD_APPOINTMENT_ID = 4;

@Injectable()
export class LedgerBuildService {
    private readonly logger = new Logger(LedgerBuildService.name);

    constructor(
        private readonly repository: LedgerBuildRepository,
        private readonly authContext: AuthContextService,
        @Inject(APPOINTMENTS_QUEUE_TOKEN)
        private readonly queue: Queue<AppointmentJobData>,
        private readonly bankBalanceBuilder: BankBalanceBuilder,
        private readonly paymentPostedBuilder: PaymentPostedBuilder,
        private readonly transferPostedBuilder: TransferPostedBuilder,
        private readonly transferReceivedBuilder: TransferReceivedBuilder,
        private readonly reversalBuilder: ReversalBuilder,
        private readonly openingBalanceBuilder: OpeningBalanceBuilder,
        private readonly revenueReceivedBuilder: RevenueReceivedBuilder,
        private readonly chargeGeneratedBuilder: ChargeGeneratedBuilder,
        private readonly chargePaidBuilder: ChargePaidBuilder,
        private readonly chargeCanceledBuilder: ChargeCanceledBuilder,
        private readonly chargeExpiredBuilder: ChargeExpiredBuilder,
        private readonly chargeRefundedBuilder: ChargeRefundedBuilder,
        private readonly revenueRecognizedBuilder: RevenueRecognizedBuilder,
        private readonly expenseRecognizedBuilder: ExpenseRecognizedBuilder,
        private readonly pendingExpensesBuilder: PendingExpensesBuilder,
        private readonly pendingRevenuesBuilder: PendingRevenuesBuilder,
    ) {}

    async build(): Promise<void> {
        const clientId = this.authContext.getClientId();
        this.logger.log(`Iniciando ledger build para cliente ${clientId}`);

        const [
            bankBalance,
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
        ] = await Promise.all([
            this.bankBalanceBuilder.build(),
            this.paymentPostedBuilder.build(),
            this.transferPostedBuilder.build(),
            this.transferReceivedBuilder.build(),
            this.reversalBuilder.build(),
            this.openingBalanceBuilder.build(),
            this.revenueReceivedBuilder.build(),
            this.chargeGeneratedBuilder.build(),
            this.chargePaidBuilder.build(),
            this.chargeCanceledBuilder.build(),
            this.chargeExpiredBuilder.build(),
            this.chargeRefundedBuilder.build(),
            this.revenueRecognizedBuilder.build(),
            this.expenseRecognizedBuilder.build(),
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
            pending: {
                expenses: pendingExpenses,
                revenues: pendingRevenues,
            },
        };

        await this.repository.save(build);
        this.logger.log(`Ledger build concluído para cliente ${clientId}`);
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
