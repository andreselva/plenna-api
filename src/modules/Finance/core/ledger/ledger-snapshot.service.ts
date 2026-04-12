import { Injectable, Logger } from '@nestjs/common';
import { LedgerSnapshot } from 'src/EntityModels/ledger-snapshot';
import DateHelper from 'src/Shared/Utils/DateHelper';
import { LedgerSnapshotRepository } from './ledger-snapshot.repository';

const EVENT_THRESHOLD = 50;
const MAX_DAYS_WITHOUT_SNAPSHOT = 7;

@Injectable()
export class LedgerSnapshotService {
    private readonly logger = new Logger(LedgerSnapshotService.name);

    constructor(private readonly repository: LedgerSnapshotRepository) {}

    async generateForClient(): Promise<void> {
        const accountIds = await this.repository.getAccountIds();
        this.logger.log(`Verificando snapshots para ${accountIds.length} conta(s)`);

        for (const accountId of accountIds) {
            try {
                await this.generateForAccount(accountId);
            } catch (error: any) {
                this.logger.error(`Erro ao gerar snapshot para conta ${accountId}: ${error.message}`);
            }
        }
    }

    async generateForAccount(accountId: number): Promise<void> {
        const lastSnapshot = await this.repository.getLatestSnapshot(accountId);
        const lastEvent = await this.repository.getLastEventForAccount(accountId);

        if (!lastEvent) {
            this.logger.warn(`Nenhum evento encontrado para a conta ${accountId}, snapshot ignorado`);
            return;
        }

        if (lastSnapshot && lastSnapshot.lastEventId === lastEvent.id) {
            this.logger.log(`Conta ${accountId} sem eventos novos, snapshot ignorado`);
            return;
        }

        const eventCount = await this.repository.countEventsSince(accountId, lastSnapshot?.lastEventId ?? null);
        const daysSinceLast = DateHelper.daysSince(lastSnapshot?.snapshotDate ?? null);

        const thresholdReached = eventCount >= EVENT_THRESHOLD;
        const staleLimitReached = daysSinceLast >= MAX_DAYS_WITHOUT_SNAPSHOT;

        if (!thresholdReached && !staleLimitReached) {
            this.logger.log(
                `Conta ${accountId}: ${eventCount} evento(s) novo(s), último snapshot há ${daysSinceLast} dia(s) — critério não atingido, ignorado`,
            );
            return;
        }

        const reason = thresholdReached ? `${eventCount} eventos (>= ${EVENT_THRESHOLD})` : `${daysSinceLast} dias sem snapshot (>= ${MAX_DAYS_WITHOUT_SNAPSHOT})`;

        const delta = await this.repository.computeBalanceDelta(accountId, lastSnapshot?.lastEventId ?? null);
        const newBalance = Number(lastSnapshot?.balance ?? 0) + delta;

        const snapshot = new LedgerSnapshot();
        snapshot.accountId = accountId;
        snapshot.balance = newBalance;
        snapshot.lastEventId = lastEvent.id;
        snapshot.lastSequenceNumber = lastEvent.sequenceNumber;
        snapshot.lastEventHash = lastEvent.eventHash;
        snapshot.snapshotDate = DateHelper.getCurrentDate();
        snapshot.createdAt = DateHelper.getCurrentDate();

        await this.repository.save(snapshot);
        this.logger.log(`Snapshot gerado para conta ${accountId}: saldo=${newBalance}, motivo=${reason}`);
    }

}
