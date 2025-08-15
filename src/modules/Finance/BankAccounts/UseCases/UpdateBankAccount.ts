import { Injectable } from "@nestjs/common";
import BankAccountsRepository from "../BankAccountsRepository";
import BankAccountDTO from "../DTOs/BankAccountDTO";
import BankAccount from "src/EntityModels/BankAccount";

@Injectable()
export default class UpdateBankAccount {
    constructor(
        private readonly repository: BankAccountsRepository
    ) { }

    async execute(id: number, bankAccount: BankAccountDTO) {
        bankAccount.id = id;
        const entity = BankAccount.fromDTO(bankAccount);
        const updatedBankAccount = await this.repository.saveBankAccount(entity);
        return { bankAccount: updatedBankAccount };
    }
}