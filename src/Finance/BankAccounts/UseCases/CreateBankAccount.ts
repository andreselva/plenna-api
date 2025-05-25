import { Injectable } from "@nestjs/common";
import BankAccountsRepository from "../BankAccountsRepository";
import BankAccount from "../Entity/BankAccount";
import BankAccountDTO from "../DTOs/BankAccountDTO";

@Injectable()
export default class CreateBankAccount {
    constructor(
        private readonly repository: BankAccountsRepository
    ) { }

    async execute(bankAccount: BankAccountDTO) {
        if (!bankAccount.icon) {
            bankAccount.icon = "";
        }

        if (!bankAccount.dueDate) {
            bankAccount.dueDate = "";
        }

        if (bankAccount.closingDate) {
            bankAccount.closingDate = "";
        }

        const entity = new BankAccount(
            bankAccount.name,
            bankAccount.generateInvoice,
            bankAccount.icon,
            bankAccount.dueDate,
            bankAccount.closingDate
        );
        
        return await this.repository.createBankAccount(entity);
    }
}