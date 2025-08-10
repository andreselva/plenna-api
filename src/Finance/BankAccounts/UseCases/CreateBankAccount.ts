import { Injectable } from "@nestjs/common";
import BankAccountsRepository from "../BankAccountsRepository";
import BankAccount from "../../../EntityModels/BankAccount";
import BankAccountDTO from "../DTOs/BankAccountDTO";

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