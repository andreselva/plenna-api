import { Injectable } from "@nestjs/common";
import { FinancialEvents } from "src/EntityModels/FinancialEvent";
import { LedgerBuilder } from "./ledger.builder";
import { LedgerEntry } from "src/EntityModels/ledger-entry";
import { HelperFunctions } from "src/Shared/Utils/HelperFunctions";
import { EventAlreadyProcessedException } from "./exceptions/EventAlreadyProcessedException";
import { InvalidQuantityLedgerEntriesException } from "./exceptions/InvalidQuantityLedgerEntriesException";
import { LedgerResolver } from "./ledger.resolver";

@Injectable()
export class LedgerEngine {
 constructor(
  private readonly builder: LedgerBuilder,
  private readonly resolver: LedgerResolver
 ) {}
 
 async process(event: FinancialEvents): Promise<void> {
  this.validate(event);
  
  try {
    await this.resolver.saveEventLedgerProcessing(event.id);
  } catch (e) {
    if (HelperFunctions.isDuplicateKeyError(e)) {
      throw new EventAlreadyProcessedException(event.id);
    }
    throw e;
  }

  const entries: LedgerEntry[] = await this.builder.build(event);
  if (entries.length % 2 !== 0) {
   throw new InvalidQuantityLedgerEntriesException(event.id);
  }

  await this.resolver.saveDoubleLedgerEntries(entries);
 }

 private validate(event: FinancialEvents): void {
  if (HelperFunctions.isNullable(event.accountId, true, true)) {
   throw Error(`invalid account id`);
  }

  if (HelperFunctions.isNullable(event.id, true, true)) {
   throw new Error(`invalid eventId`);
  }
 }
}