import { FinancialEvents } from "src/EntityModels/FinancialEvent";
import { LedgerEntry } from "src/EntityModels/ledger-entry";
import DateHelper from "src/Shared/Utils/DateHelper";
import { Injectable } from "@nestjs/common";
import { LedgerResolver } from "./ledger.resolver";

@Injectable()
export class LedgerBuilder {

  constructor(
    private readonly resolver: LedgerResolver
  ) {}

 async build(event: FinancialEvents): Promise<LedgerEntry[]> {
  const account = await this.resolver.getBankAccountById(event.accountId);
  const metadata = this.resolver.buildMetadata(event);
  const { originAmount, destinationAmount } = this.resolver.defineAmounts(event);

  const originEntry = new LedgerEntry();
  originEntry.eventId = event.id;
  originEntry.entityId = event.referenceId;
  originEntry.entityType = event.referenceType;
  originEntry.type = this.resolver.defineTypeOrigin(event.referenceType);
  originEntry.amount = originAmount;
  originEntry.accountId = event.accountId;
  originEntry.metadata = metadata;
  originEntry.liquidity = false;
  originEntry.createdAt = DateHelper.getCurrentDate();
 
  const destinationEntry = new LedgerEntry();
  destinationEntry.eventId = event.id;
  destinationEntry.entityId = event.referenceId;
  destinationEntry.entityType = event.referenceType;
  destinationEntry.amount = destinationAmount;
  destinationEntry.type = this.resolver.defineTypeDestination(account);
  destinationEntry.accountId = event.accountId;
  destinationEntry.metadata = metadata;
  destinationEntry.liquidity = this.resolver.defineDestinationLiquidity(event);
  destinationEntry.createdAt = DateHelper.getCurrentDate();
 
  return [originEntry, destinationEntry]
 }
}