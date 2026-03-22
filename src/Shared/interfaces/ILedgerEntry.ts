import { LedgerEntryTypeEnum } from "src/enum/ledger-entry-type.enum";

export interface ILedgerEntry {
 id: number;
 clientId: number;
 eventId: number;
 accountId: number;
 entityId: number;
 entityType: string;
 amount: number;
 type: LedgerEntryTypeEnum;
 metadata: JSON;
 liquidity: boolean;
 createdAt: string;
}