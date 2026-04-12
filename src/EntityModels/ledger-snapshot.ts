import IEntity from 'src/Shared/interfaces/IEntity';
import { ILedgerSnapshot } from 'src/Shared/interfaces/ILedgerSnapshot';
import EntityModel from './entity.model';

export class LedgerSnapshot extends EntityModel implements IEntity {
    public id: number;
    public clientId: number;
    public accountId: number;
    public balance: number;
    public lastEventId: number;
    public lastSequenceNumber: number;
    public lastEventHash: string;
    public snapshotDate: string;
    public createdAt: string;

    static fromRow(row: ILedgerSnapshot): LedgerSnapshot {
        const snapshot = new LedgerSnapshot();
        snapshot.id = row.id;
        snapshot.clientId = row.clientId;
        snapshot.accountId = row.accountId;
        snapshot.balance = row.balance;
        snapshot.lastEventId = row.lastEventId;
        snapshot.lastSequenceNumber = row.lastSequenceNumber;
        snapshot.lastEventHash = row.lastEventHash;
        snapshot.snapshotDate = row.snapshotDate;
        snapshot.createdAt = row.createdAt;
        return snapshot;
    }

    getTableName(): string {
        return 'ledger_snapshots';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return [];
    }
}
