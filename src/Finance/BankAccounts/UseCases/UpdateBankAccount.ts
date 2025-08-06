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
        bankAccount.id = id;
        const entity = BankAccount.fromDTO(bankAccount);
        const updatedBankAccount = await this.repository.saveBankAccount(entity);
        return { bankAccount: updatedBankAccount };
    }
}