import { Injectable } from '@nestjs/common';
import { Transfer } from 'src/EntityModels/Transfer';
import { TransferDTO } from './DTOs/transfer.dto';
import { TransfersRepository } from './transfers.repository';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';
import { FinancialEventsEnum } from 'src/enum/financial-events.enum';
import { PaymentType } from '../Payment/Types/payment.type';
import { FinancialEventsService } from '../core/financial-events/financial-events.service';

@Injectable()
export class TransfersService {
    constructor(
        private readonly repository: TransfersRepository,
        private readonly database: MySQLDatabase,
        private readonly financialEvents: FinancialEventsService
    ) {}

    async list() {
        return await this.repository.list();
    }

    async create(dto: TransferDTO) {
        const entity = Transfer.fromDTO(dto);
        return this.database.transaction(async () => {
            const transfer = await this.repository.saveEntity(entity);
            await this.registerFinancialEvent(transfer);
        })
    }

    async revertTransfer(transfer: TransferDTO) {
        const originAccountId = transfer.originAccount;
        const targetAccountId = transfer.targetAccount;
        transfer.originAccount = targetAccountId;
        transfer.targetAccount = originAccountId;
        transfer.id = 0;
        return await this.create(transfer);
    }

    private async registerFinancialEvent(transfer: Transfer): Promise<void> {
        await this.financialEvents.register({
            accountId: transfer.originAccount,
            type: FinancialEventsEnum.TRANSFER_POSTED,
            amount: transfer.amount,
            referenceType: PaymentType.TRANSFER,
            referenceId: transfer.id
        })

        await this.financialEvents.register({
            accountId: transfer.targetAccount,
            type: FinancialEventsEnum.TRANSFER_RECEIVED,
            amount: transfer.amount,
            referenceType: PaymentType.TRANSFER,
            referenceId: transfer.id
        })
    }

    async update(id: number, dto: TransferDTO) {
        dto.id = id;
        const entity = Transfer.fromDTO(dto);
        return await this.repository.saveEntity(entity);
    }
}
