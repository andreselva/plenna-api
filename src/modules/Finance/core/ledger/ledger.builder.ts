import { FinancialEvents } from "src/EntityModels/FinancialEvent";
import { LedgerEntry } from "src/EntityModels/ledger-entry";
import { LedgerEntryTypeEnum } from "src/enum/ledger-entry-type.enum";
import { PaymentType } from "../../Payment/Types/payment.type";
import DateHelper from "src/Shared/Utils/DateHelper";
import { LedgerRepository } from "./ledger.repository";
import { BankAccount } from "src/EntityModels/BankAccount";
import { BankAccountTypeEnum } from "src/enum/bank-account-type.enum";
import { FinancialEventsEnum } from "src/enum/financial-events.enum";
import { InvalidEventTypeException } from "./exceptions/InvalidEventTypeException";
import { HelperFunctions } from "src/Shared/Utils/HelperFunctions";

export class LedgerBuilder {
 private repository: LedgerRepository;

 constructor(repository: LedgerRepository) {
    this.repository = repository;
 }

 async build(event: FinancialEvents): Promise<LedgerEntry[]> {
  const account = await this.repository.getBankAccountById(event.accountId);
  const metadata = this.buildMetadata(event);
  const { originAmount, destinationAmount } = this.defineAmounts(event);

  const originEntry = new LedgerEntry();
  originEntry.eventId = event.id;
  originEntry.entityId = event.referenceId;
  originEntry.entityType = event.referenceType;
  originEntry.type = this.defineTypeOrigin(event.referenceType);
  originEntry.amount = originAmount;
  originEntry.accountId = originEntry.type === LedgerEntryTypeEnum.T ? event.referenceId : event.accountId;
  originEntry.metadata = metadata;
  originEntry.liquidity = originEntry.type === LedgerEntryTypeEnum.T;
  originEntry.createdAt = DateHelper.getCurrentDate();
 
  const destinationEntry = new LedgerEntry();
  destinationEntry.eventId = event.id;
  destinationEntry.entityId = event.referenceId;
  destinationEntry.entityType = event.referenceType;
  destinationEntry.amount = destinationAmount;
  destinationEntry.type = this.defineTypeDestination(account);
  destinationEntry.accountId = event.accountId;
  destinationEntry.metadata = metadata;
  destinationEntry.liquidity = true;
  destinationEntry.createdAt = DateHelper.getCurrentDate();
 
  return [originEntry, destinationEntry]
 }

 private defineTypeOrigin(referenceType: PaymentType): LedgerEntryTypeEnum {
  const types = {
    [PaymentType.EXPENSE]: LedgerEntryTypeEnum.E,
    [PaymentType.REVENUE]: LedgerEntryTypeEnum.R,
    [PaymentType.TRANSFER]: LedgerEntryTypeEnum.T,
    [PaymentType.INVOICE]: LedgerEntryTypeEnum.INVOICE,
    [PaymentType.ACCOUNT_OPENING]: LedgerEntryTypeEnum.ACCOUNT_OPENING
  }
  return types[referenceType];
 }

 private defineTypeDestination(account: BankAccount): LedgerEntryTypeEnum {
  const types = {
    [BankAccountTypeEnum.CHECKING]: LedgerEntryTypeEnum.C,
    [BankAccountTypeEnum.DIGITAL_WALLET]: LedgerEntryTypeEnum.D_WALLET,
    [BankAccountTypeEnum.INVESTMENT]: LedgerEntryTypeEnum.INVESTMENT,
    [BankAccountTypeEnum.PHYSICAL_WALLET]: LedgerEntryTypeEnum.P_WALLET,
    [BankAccountTypeEnum.SAVINGS]: LedgerEntryTypeEnum.S
  }
  return types[account.type];
 }

 private defineAmounts(event: FinancialEvents): { originAmount: number, destinationAmount: number } {
  if (HelperFunctions.isNullable(event.amount, true, true)) {
    return { originAmount: 0, destinationAmount: 0 }
  }
  
  switch (event.type) {
    case FinancialEventsEnum.OPENING_BALANCE:
      return { originAmount: -Math.abs(event.amount), destinationAmount: Math.abs(event.amount) };

    case FinancialEventsEnum.PAYMENT_POSTED:
      return { originAmount: Math.abs(event.amount), destinationAmount: -Math.abs(event.amount) };

    case FinancialEventsEnum.REVENUE_RECEIVED:
    case FinancialEventsEnum.TRANSFER_POSTED:
      return { originAmount: -Math.abs(event.amount), destinationAmount: Math.abs(event.amount) };

    case FinancialEventsEnum.REVERSAL:
      if ([PaymentType.EXPENSE, PaymentType.INVOICE].includes(event.referenceType)) {
       return { originAmount: -Math.abs(event.amount), destinationAmount: Math.abs(event.amount) };
      } else if (event.referenceType === PaymentType.REVENUE) {
       return { originAmount: Math.abs(event.amount), destinationAmount: -Math.abs(event.amount) };
      }
      
    default:
      throw new InvalidEventTypeException(event.id);
  }
 }

 private buildMetadata(event: FinancialEvents): object {
  return {
   event: {
    sequenceNumber: event.sequenceNumber,
    createdAt: event.createdAt,
    hash: event.eventHash,
    eventType: event.type
   },
   system: {
    createdAt: DateHelper.getCurrentDate(),
   }
  };
 }
}