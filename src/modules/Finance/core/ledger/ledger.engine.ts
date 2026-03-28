import { Injectable } from "@nestjs/common";
import { FinancialEvents } from "src/EntityModels/FinancialEvent";
import { LedgerRepository } from "./ledger.repository";
import { LedgerBuilder } from "./ledger.builder";
import { LedgerEntry } from "src/EntityModels/ledger-entry";
import { HelperFunctions } from "src/Shared/Utils/HelperFunctions";
import { PaymentType } from "../../Payment/Types/payment.type";
import { LedgerEventProcessing } from "src/EntityModels/LedgerEventProcessing";
import DateHelper from "src/Shared/Utils/DateHelper";
import { EventAlreadyProcessedException } from "./exceptions/EventAlreadyProcessedException";
import { InvalidQuantityLedgerEntriesException } from "./exceptions/InvalidQuantityLedgerEntriesException";

@Injectable()
export class LedgerEngine {
 constructor(
    private readonly repository: LedgerRepository
 ) {}
 
 async process(event: FinancialEvents): Promise<void> {
  this.validate(event);

  await this.repository.executeInTransaction(async () => {
    try {
      await this.saveEventProcessing(event);
    } catch (e) {
      if (HelperFunctions.isDuplicateKeyError(e)) {
        throw new EventAlreadyProcessedException(event.id);
      }
      throw e;
    }

    const builder = new LedgerBuilder(this.repository);
    const entries: LedgerEntry[] = await builder.build(event);
    if (entries.length % 2 !== 0) {
      throw new InvalidQuantityLedgerEntriesException(event.id);
    }

    for (const entry of entries) {
      await this.repository.save(entry);
    }
  });
 }

 private async saveEventProcessing(event: FinancialEvents): Promise<void> {
  const ledgerEventProcessing = new LedgerEventProcessing();
  ledgerEventProcessing.eventId = event.id;
  ledgerEventProcessing.processedAt = DateHelper.getCurrentDate();
  await this.repository.saveLedgerEventProcessing(ledgerEventProcessing);
 }

 private validate(event: FinancialEvents): void {
  if (HelperFunctions.isNullable(event.accountId, true, true)) {
   throw Error(`invalid account id`);
  }

  if (HelperFunctions.isNullable(event.id, true, true)) {
   throw new Error(`invalid eventId`);
  }

  if (event.referenceType === PaymentType.TRANSFER && event.referenceId === event.accountId) {
   throw new Error(`referenceId and accountId are the same for the TRANSFER type`);
  }
 }
}
