import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import { BankAccountTypeEnum } from "src/enum/bank-account-type.enum";
import { IBankAccountRow } from "src/Shared/interfaces/IBankAccountRow";

export class BankAccount extends EntityModel implements IEntity {
    public id: number = 0;
    public clientId: number;
    public name: string;
    public type: BankAccountTypeEnum = BankAccountTypeEnum.CHECKING;
    public bankCode: number;
    public agency: string;
    public accountNumber: string;
    public initialBalance: number;
    public currentBalance: number;
    public isActive: boolean;
    public createdAt: string;
    public updatedAt: string;
    public deletedAt: string;

    static fromRow(i: IBankAccountRow) {
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
        ba.isActive = i.isActive;
        ba.createdAt = i.createdAt;
        ba.updatedAt = i.updatedAt;
        ba.deletedAt = i.deletedAt;
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