import { Injectable } from "@nestjs/common";
import { LedgerRepository } from "./ledger.repository";
import { LedgerEventProcessing } from "src/EntityModels/LedgerEventProcessing";
import DateHelper from "src/Shared/Utils/DateHelper";
import { LedgerEntry } from "src/EntityModels/ledger-entry";
import { FinancialEvents } from "src/EntityModels/FinancialEvent";
import { HelperFunctions } from "src/Shared/Utils/HelperFunctions";
import { FinancialEventsEnum } from "src/enum/financial-events.enum";
import { PaymentType } from "../../Payment/Types/payment.type";
import { InvalidEventTypeException } from "./exceptions/InvalidEventTypeException";
import { BankAccount } from "src/EntityModels/BankAccount";
import { LedgerEntryTypeEnum } from "src/enum/ledger-entry-type.enum";
import { BankAccountTypeEnum } from "src/enum/bank-account-type.enum";

@Injectable()
export class LedgerResolver {
    constructor(
        private readonly repository: LedgerRepository
    ) {}

    async saveDoubleLedgerEntries(entries: LedgerEntry[]): Promise<void> {
        for (const entry of entries) {
            await this.repository.save(entry);
        }
    }

    async saveEventLedgerProcessing(eventId: number): Promise<void> {
        const ledgerEventProcessing = new LedgerEventProcessing();
        ledgerEventProcessing.eventId = eventId;
        ledgerEventProcessing.processedAt = DateHelper.getCurrentDate();
        await this.repository.saveLedgerEventProcessing(ledgerEventProcessing);
    }

    async getBankAccountById(accountId: number) {
        return this.repository.getBankAccountById(accountId);
    }

    buildMetadata(event: FinancialEvents): object {
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

    defineAmounts(event: FinancialEvents): { originAmount: number, destinationAmount: number } {
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
            
            case FinancialEventsEnum.CHARGE_GENERATED:
            
            default:
                throw new InvalidEventTypeException(event.id);
        }
    }

    defineTypeOrigin(referenceType: PaymentType): LedgerEntryTypeEnum {
        const types = {
            [PaymentType.EXPENSE]: LedgerEntryTypeEnum.E,
            [PaymentType.REVENUE]: LedgerEntryTypeEnum.R,
            [PaymentType.TRANSFER]: LedgerEntryTypeEnum.T,
            [PaymentType.INVOICE]: LedgerEntryTypeEnum.INVOICE,
            [PaymentType.ACCOUNT_OPENING]: LedgerEntryTypeEnum.ACCOUNT_OPENING
        }
        return types[referenceType];
    }

    defineTypeDestination(account: BankAccount): LedgerEntryTypeEnum {
        const types = {
            [BankAccountTypeEnum.CHECKING]: LedgerEntryTypeEnum.C,
            [BankAccountTypeEnum.DIGITAL_WALLET]: LedgerEntryTypeEnum.D_WALLET,
            [BankAccountTypeEnum.INVESTMENT]: LedgerEntryTypeEnum.INVESTMENT,
            [BankAccountTypeEnum.PHYSICAL_WALLET]: LedgerEntryTypeEnum.P_WALLET,
            [BankAccountTypeEnum.SAVINGS]: LedgerEntryTypeEnum.S
        }
        return types[account.type];
    }
}