import { BankAccountTypeEnum } from "src/enum/bank-account-type.enum";

export interface IBankAccountRow {
    id: number;
    clientId: number;
    name: string;
    type: BankAccountTypeEnum;
    bankCode: number;
    agency: string;
    accountNumber: string;
    initialBalance: number;
    currentBalance: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
}