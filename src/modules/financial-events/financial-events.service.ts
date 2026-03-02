import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FinancialEventsEnum } from 'src/enum/financial-events.enum';
import { PaymentType } from '../Finance/Payment/Types/payment.type';
import { FinancialEvents } from 'src/EntityModels/FinancialEvent';
import DateHelper from 'src/Shared/Utils/DateHelper';
import { AuthContextService } from '../Auth/auth-context.service';
import { RedisKeys } from '../redis/redis.keys';
import RedisService from '../redis/redis-service';
import { FinancialEventsRepository } from './financial-events.repository';

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
        private readonly redisService: RedisService,
        private readonly repository: FinancialEventsRepository
    ) {}

    async register(data: IFinancialEvent) {

    }

    private async buildEvent(data: IFinancialEvent): Promise<FinancialEvents> {
        const financialEvent = new FinancialEvents();
        financialEvent.clientId = this.authContext.getClientId();
        financialEvent.accountId = data.accountId;
        financialEvent.type = data.type;
        financialEvent.amount = data.amount;
        financialEvent.referenceId = data.referenceId;
        financialEvent.referenceType = data.referenceType;
        financialEvent.ocurredAt = DateHelper.getCurrentDate();
        financialEvent.sequenceNumber = await this.getSequenceNumber();
        financialEvent.previousHash = await this.getPreviousHash();
        financialEvent.eventHash = '231';
        return financialEvent;
    }

    private async getSequenceNumber(): Promise<number> {
        const rk = RedisKeys.sequenceNumber(this.authContext.getClientId());
        const redisValue = await this.redisService.get(rk);
        if (redisValue === null || redisValue === undefined) {
            let sequenceNumber = await this.repository.getMaxSequenceNumber();
            if (sequenceNumber == null) {
                return 1;
            }
        }
        return redisValue + 1;
    }

    private async getPreviousHash(): Promise<string> {
        const rk = RedisKeys.previousHash(this.authContext.getClientId());
        const redisValue = await this.redisService.get(rk);
        if (redisValue === null || redisValue === undefined) {
            let previousHash = await this.repository.getLastEventHash();
            if (previousHash === null) {
                return 'INITIAL';
            }
        }
        return redisValue;
    }

    //private generateEventHash(previousHash: string, )

    private generateCanonicalPayload() {

    }
}
