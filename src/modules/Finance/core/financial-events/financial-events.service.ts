import { Injectable } from '@nestjs/common';
import { FinancialEventsEnum } from 'src/enum/financial-events.enum';
import { FinancialEvents } from 'src/EntityModels/FinancialEvent';
import DateHelper from 'src/Shared/Utils/DateHelper';
import { FinancialEventsRepository } from './financial-events.repository';
import { HelperFunctions } from 'src/Shared/Utils/HelperFunctions';
import { HasherHelper } from 'src/Shared/Utils/HasherHelper';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import { TransactionContext } from 'src/modules/Config/Database/transaction-context';
import { PaymentType } from '../../Payment/Types/payment.type';
import { LedgerEngine } from '../ledger/ledger.engine';
import { FinancialEventOutsideTransactionException } from './exceptions/financial-event-outside-transaction.exception';

export interface IFinancialEvent {
  accountId: number;
  type: FinancialEventsEnum;
  amount: number;
  referenceType: PaymentType;
  referenceId: number;
}

@Injectable()
export class FinancialEventsService {
  constructor(
    private readonly authContext: AuthContextService,
    private readonly repository: FinancialEventsRepository,
    private readonly ledgerEngine: LedgerEngine,
    private readonly transactionContext: TransactionContext,
  ) {}

  async register(data: IFinancialEvent): Promise<FinancialEvents> {
    if (!this.transactionContext.hasTransaction()) {
      throw new FinancialEventOutsideTransactionException(`register() must be called within a transaction`);
    }
    const event = await this.buildEvent(data);
    const saved = await this.repository.saveEvent(event);
    await this.ledgerEngine.process(saved);
    return saved;
  }

  private async buildEvent(data: IFinancialEvent): Promise<FinancialEvents> {
    const lastEvent = await this.repository.getLastEvent();
    const event = new FinancialEvents();
    event.clientId = this.authContext.getClientId();
    event.accountId = data.accountId;
    event.type = data.type;
    event.amount = data.amount;
    event.occurredAt = DateHelper.getCurrentDate();
    event.createdAt = DateHelper.getCurrentDate();
    event.sequenceNumber = this.getSequenceNumber(lastEvent);
    event.referenceType = data.referenceType;
    event.referenceId = data.referenceId;
    event.previousHash = this.getPreviousHash(lastEvent);
    event.eventHash = this.generateEventHash(event);
    return event;
  }

  private getSequenceNumber(lastEvent: FinancialEvents | null): number {
    if (lastEvent !== null) {
      return lastEvent.sequenceNumber + 1;
    }
    return 1;
  }

  private getPreviousHash(lastEvent: FinancialEvents | null): string {
    if (lastEvent !== null) {
      return lastEvent.eventHash;
    }
    return 'INITIAL';
  }

  private generateEventHash(event: FinancialEvents): string {
    const payload = this.generatePayloadForHash(event);
    const canonical = HelperFunctions.deterministicJson({
      previousHash: event.previousHash,
      event: payload,
    });

    return HasherHelper.sha256(canonical);
  }

  private generatePayloadForHash(event: FinancialEvents): object {
    return {
      clientId: event.clientId,
      accountId: event.accountId,
      type: event.type,
      amount: event.amount,
      occurredAt: event.occurredAt,
      sequenceNumber: event.sequenceNumber,
      referenceType: event.referenceType,
      referenceId: event.referenceId,
    };
  }
}