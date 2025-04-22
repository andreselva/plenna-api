import { Injectable } from "@nestjs/common";
import BankAccountsRepository from "../BankAccountsRepository";
import BankAccountDTO from "../DTOs/BankAccountDTO";
import BankAccount from "../Entity/BankAccount";

@Injectable()
export default class UpdateBankAccount {
    constructor(
        private readonly repository: BankAccountsRepository
    ) { }

    async execute(id: string, bankAccount: BankAccountDTO) {
        if (!id) {
            throw new Error("ID is required to update a bank account.");
        }

        if (bankAccount.icon === "" || bankAccount.icon === undefined) {
            bankAccount.icon = "";
        }
        
        const entity = new BankAccount(bankAccount.name, bankAccount.icon, Number(id));
        return await this.repository.updateBankAccount(entity);
    }
}