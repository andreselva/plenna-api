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
        const entity = new BankAccount(bankAccount.name, bankAccount.icon);
        return await this.repository.createBankAccount(entity);
    }
}