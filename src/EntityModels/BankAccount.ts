import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import { BankAccountTypeEnum } from "src/enum/bank-account-type.enum";
import { IBankAccountRow } from "src/Shared/interfaces/IBankAccountRow";
import { BankAccountDTO } from "src/modules/Finance/bank-accounts/DTOs/bank-account.dto";
import DateHelper from "src/Shared/Utils/DateHelper";

export class BankAccount extends EntityModel implements IEntity {
    public id: number = 0;
    public clientId: number;
    public name: string;
    public type: BankAccountTypeEnum = BankAccountTypeEnum.CHECKING;
    public bankCode: number = 0;
    public agency: string = '';
    public accountNumber: string = '';
    public initialBalance: number;
    public currentBalance: number;
    public isActive: boolean;
    public createdAt: string;
    public updatedAt: string;
    public deletedAt: string;

    static fromRow(i: IBankAccountRow): BankAccount {
        const ba = new BankAccount();
        ba.id = i.id;
        ba.clientId = i.clientId;
        ba.name = i.name;
        ba.type = i.type;
        ba.bankCode = i.bankCode;
        ba.agency = i.agency;
        ba.accountNumber = i.accountNumber;
        ba.initialBalance = i.initialBalance;
        ba.currentBalance = i.currentBalance;
        ba.isActive = Boolean(i.isActive);
        return ba;
    }

    static fromDTO(dto: BankAccountDTO) {
        const ba = new BankAccount();
        ba.id = dto.id;
        ba.name = dto.name;
        ba.type = dto.type;
        ba.bankCode = dto.bankCode ?? '';
        ba.agency = dto.agency ?? '';
        ba.accountNumber = dto.accountNumber ?? '';
        ba.initialBalance = dto.initialBalance;
        ba.isActive = dto.isActive;
        if (!(ba.id > 0)) {
            ba.createdAt = DateHelper.getCurrentDate();
            ba.currentBalance = ba.initialBalance;
        } else {
            ba.updatedAt = DateHelper.getCurrentDate();
        }
        return ba;
    }

    getTableName(): string {
        return 'bank_accounts';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return [];
    }
}