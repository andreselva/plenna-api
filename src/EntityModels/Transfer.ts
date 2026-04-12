import IEntity from 'src/Shared/interfaces/IEntity';
import EntityModel from './entity.model';
import { ITransferRow } from 'src/Shared/interfaces/ITransferRow';
import { TransferDTO } from 'src/modules/Finance/transfers/DTOs/transfer.dto';
import DateHelper from 'src/Shared/Utils/DateHelper';

export class Transfer extends EntityModel implements IEntity {
    public id: number = 0;
    public clientId: number;
    public originAccount: number;
    public targetAccount: number;
    public amount: number;
    public transferDate: string;
    public createdAt: string;
    public updatedAt: string;

    public static ignoredProperties: string[] = [];

    static fromRow(row: ITransferRow): Transfer {
        const t = new Transfer();
        t.id = row.id;
        t.originAccount = row.originAccount;
        t.targetAccount = row.targetAccount;
        t.amount = row.amount;
        t.transferDate = DateHelper.toISODate(row.transferDate) as string;
        return t;
    }

    static fromDTO(dto: TransferDTO): Transfer {
        const t = new Transfer();
        t.id = dto.id ?? 0;
        t.originAccount = dto.originAccount;
        t.targetAccount = dto.targetAccount;
        t.amount = dto.amount;
        t.transferDate = dto.transferDate;
        if (!(t.id > 0)) {
            t.createdAt = DateHelper.getCurrentDate();
        } else {
            t.updatedAt = DateHelper.getCurrentDate();
        }
        return t;
    }

    getTableName(): string {
        return 'transfer';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return Transfer.ignoredProperties;
    }
}
