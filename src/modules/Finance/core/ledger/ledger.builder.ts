import { FinancialEvents } from "src/EntityModels/FinancialEvent";
import { LedgerEntry } from "src/EntityModels/ledger-entry";
import { LedgerEntryTypeEnum } from "src/enum/ledger-entry-type.enum";
import { PaymentType } from "../../Payment/Types/payment.type";
import DateHelper from "src/Shared/Utils/DateHelper";
import { LedgerRepository } from "./ledger.repository";
import { BankAccount } from "src/EntityModels/BankAccount";
import { BankAccountTypeEnum } from "src/enum/bank-account-type.enum";

export class LedgerBuilder {
 private repository: LedgerRepository;

 constructor(repository: LedgerRepository) {
    this.repository = repository;
 }

 async build(event: FinancialEvents) {
  const origin = this.buildOrigin(event);
  const destination = await this.buildDestination(event);
  return [origin, destination] as LedgerEntry[];
 }

 private buildOrigin(event: FinancialEvents) {
  const originEntry = new LedgerEntry();
  originEntry.eventId = event.id;
  originEntry.entityId = event.referenceId;
  originEntry.entityType = event.referenceType;
  originEntry.type = this.defineTypeOrigin(event.referenceType);

  if (originEntry.type === LedgerEntryTypeEnum.R) {
    event.amount = -Math.abs(event.amount);
  } else {
    event.amount = Math.abs(event.amount);
  }

  originEntry.amount = event.amount;
  originEntry.accountId = originEntry.type === LedgerEntryTypeEnum.T ? event.referenceId : event.accountId;
  originEntry.metadata = this.buildMetadata(event);
  originEntry.liquidity = originEntry.type === LedgerEntryTypeEnum.T;
  originEntry.createdAt = DateHelper.getCurrentDate();
  return originEntry;
 }

 private async buildDestination(event: FinancialEvents) {
  const destinationEntry = new LedgerEntry();
  const account = await this.repository.getBankAccountById(event.accountId);
  destinationEntry.eventId = event.id;
  destinationEntry.entityId = event.referenceId;
  destinationEntry.entityType = event.referenceType;
  destinationEntry.amount = event.amount > 0 ? -Math.abs(event.amount) : Math.abs(event.amount);
  destinationEntry.type = this.defineTypeDestination(account);
  destinationEntry.accountId = event.accountId;
  destinationEntry.metadata = this.buildMetadata(event);
  destinationEntry.liquidity = true;
  destinationEntry.createdAt = DateHelper.getCurrentDate();
  return destinationEntry;
 }

 private defineTypeOrigin(referenceType: PaymentType) {
  const types = {
    [PaymentType.EXPENSE]: LedgerEntryTypeEnum.E,
    [PaymentType.REVENUE]: LedgerEntryTypeEnum.R,
    [PaymentType.TRANSFER]: LedgerEntryTypeEnum.T,
    [PaymentType.INVOICE]: LedgerEntryTypeEnum.INVOICE
  }
  return types[referenceType];
 }

 private defineTypeDestination(account: BankAccount) {
  const types = {
    [BankAccountTypeEnum.CHECKING]: LedgerEntryTypeEnum.C,
    [BankAccountTypeEnum.DIGITAL_WALLET]: LedgerEntryTypeEnum.D_WALLET,
    [BankAccountTypeEnum.INVESTMENT]: LedgerEntryTypeEnum.INVESTMENT,
    [BankAccountTypeEnum.PHYSICAL_WALLET]: LedgerEntryTypeEnum.P_WALLET,
    [BankAccountTypeEnum.SAVINGS]: LedgerEntryTypeEnum.S
  }
  return types[account.type];
 }

 private buildMetadata(event: FinancialEvents) {
  return {
   event: {
    sequenceNumber: event.sequenceNumber,
    createdAt: event.createdAt,
    hash: event.eventHash
   },
   system: {
    createdAt: DateHelper.getCurrentDate(),
   }
  };
 }
}