import { Injectable } from "@nestjs/common";
import BankAccountsRepository from "../BankAccountsRepository";
import BankAccountDTO from "../DTOs/BankAccountDTO";
import BankAccount from "src/EntityModels/BankAccount";

@Injectable()
export default class CreateBankAccount {
    constructor(
        private readonly repository: BankAccountsRepository
    ) { }

    async execute(bankAccount: BankAccountDTO): Promise<{ bankAccount: BankAccount }> {
        const entity = BankAccount.fromDTO(bankAccount);
        const createdBankAccount = await this.repository.saveBankAccount(entity);
        return { bankAccount: createdBankAccount };
    }
}