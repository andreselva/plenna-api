export interface ILedgerSnapshot {
    id: number;
    clientId: number;
    accountId: number;
    balance: number;
    lastEventId: number;
    lastSequenceNumber: number;
    lastEventHash: string;
    snapshotDate: string;
    createdAt: string;
}
