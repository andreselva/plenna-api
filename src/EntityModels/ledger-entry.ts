import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import { ILedgerEntry } from "src/Shared/interfaces/ILedgerEntry";
import { LedgerEntryTypeEnum } from "src/enum/ledger-entry-type.enum";

export class LedgerEntry extends EntityModel implements IEntity {
 public id: number;
 public clientId: number;
 public eventId: number;
 public accountId: number;
 public entityId: number;
 public entityType: string;
 public amount: number;
 public type: LedgerEntryTypeEnum;
 public metadata: object;
 public liquidity: boolean;
 public createdAt: string;

 static fromRow(i: ILedgerEntry) {
  const le = new LedgerEntry();
  le.id = i.id;
  le.clientId = i.clientId;
  le.eventId = i.eventId;
  le.accountId = i.accountId;
  le.entityId = i.entityId;
  le.entityType = i.entityType;
  le.amount = i.amount;
  le.type = i.type;
  le.metadata = i.metadata;
  le.liquidity = i.liquidity;
  return le;
 }

 getTableName(): string {
  return 'ledger_entries';
 }

 getPrimaryKey(): string {
  return 'id'
 }

 getIgnoredProperties(): string[] {
  return []
 }
 
}