import { Injectable } from '@nestjs/common';
import { FinancialEventsEnum } from 'src/enum/financial-events.enum';
import { PaymentType } from '../Finance/Payment/Types/payment.type';
import { FinancialEvents } from 'src/EntityModels/FinancialEvent';
import DateHelper from 'src/Shared/Utils/DateHelper';
import { AuthContextService } from '../Auth/auth-context.service';
import { RedisKeys } from '../redis/redis.keys';
import RedisService from '../redis/redis-service';
import { FinancialEventsRepository } from './financial-events.repository';
import { HelperFunctions } from 'src/Shared/Utils/HelperFunctions';
import { HasherHelper } from 'src/Shared/Utils/HasherHelper';

export interface IFinancialEvent {
  accountId: number;
  type: FinancialEventsEnum;
  amount: number;
  referenceType: PaymentType;
  referenceId: number;
}

@Injectable()
export class FinancialEventsService {
  private rkPreviousHash = '';

  constructor(
    private readonly authContext: AuthContextService,
    private readonly redisService: RedisService,
    private readonly repository: FinancialEventsRepository
  ) {}

  async register(data: IFinancialEvent) {
    const event = await this.buildEvent(data);
    const saved = await this.repository.saveEvent(event);
    if (saved?.id > 0) {
      await this.redisService.set(this.rkPreviousHash, saved.eventHash);
    }
    return saved;
  }

  private async buildEvent(data: IFinancialEvent): Promise<FinancialEvents> {
    const event = new FinancialEvents();
    event.clientId = this.authContext.getClientId();
    event.accountId = data.accountId;
    event.type = data.type;
    event.amount = data.amount;
    event.occurredAt = DateHelper.getCurrentDate();
    event.createdAt = DateHelper.getCurrentDate();
    event.sequenceNumber = await this.getSequenceNumber();
    event.referenceType = data.referenceType;
    event.referenceId = data.referenceId;
    event.previousHash = await this.getPreviousHash();
    event.eventHash = this.generateEventHash(event);
    return event;
  }

  private async getSequenceNumber(): Promise<number> {
    const rk = RedisKeys.sequenceNumber(this.authContext.getClientId());

    const redisValue = await this.redisService.get<number | string>(rk);

    if (redisValue === null) {
      const maxFromDb = await this.repository.getMaxSequenceNumber();
      const current = maxFromDb ?? 0;
      await this.redisService.set(rk, current);
    }

    return await this.redisService.incr(rk);
  }

  private async getPreviousHash(): Promise<string> {
    this.rkPreviousHash = RedisKeys.previousHash(this.authContext.getClientId());

    const redisValue = await this.redisService.get<string>(this.rkPreviousHash);
    if (redisValue !== null && redisValue !== undefined) {
      return redisValue;
    }

    const lastHashFromDb = await this.repository.getLastEventHash();
    return lastHashFromDb ?? 'INITIAL';
  }

  private generateEventHash(event: FinancialEvents): string {
    const payload = this.generatePayloadForHash(event);
    const canonical = HelperFunctions.deterministicJson({
      previousHash: event.previousHash,
      event: payload,
    });

    return HasherHelper.sha256(canonical);
  }

  private generatePayloadForHash(event: FinancialEvents) {
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