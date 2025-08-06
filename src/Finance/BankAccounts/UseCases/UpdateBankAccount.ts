import { Injectable } from "@nestjs/common";
import BankAccountsRepository from "../BankAccountsRepository";
import BankAccountDTO from "../DTOs/BankAccountDTO";
import BankAccount from "../../../EntityModels/BankAccount";

@Injectable()
export default class UpdateBankAccount {
    constructor(
        private readonly repository: BankAccountsRepository
    ) { }

    async execute(id: number, bankAccount: BankAccountDTO) {
        if (id <= 0) {
            throw new Error('Invalid ID!');
        } 
        const entity = new BankAccount();
        entity.name = bankAccount.name;
        entity.icon = bankAccount.icon !== undefined ? bankAccount.icon : '';
        entity.dueDate = bankAccount.dueDate;
        entity.closingDate = bankAccount.closingDate;
        entity.generateInvoice = Boolean(bankAccount.generateInvoice);
        entity.id = id;
        const updatedBankAccount = await this.repository.saveBankAccount(entity);
        return { bankAccount: updatedBankAccount };
    }
}