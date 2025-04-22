import { Dependencies, Injectable } from "@nestjs/common";
import GetBankAccounts from "./UseCases/GetBankAccounts";
import CreateBankAccount from "./UseCases/CreateBankAccount";
import BankAccountDTO from "./DTOs/BankAccountDTO";

@Injectable()
@Dependencies(GetBankAccounts, CreateBankAccount)
export default class BankAccountsService {
    constructor(
        private readonly getAccounts: GetBankAccounts,
        private readonly createAccount: CreateBankAccount,
    ) {}

    async getBankAccounts() {
        return await this.getAccounts.execute();
    }

    async createBankAccount(bankAccount: BankAccountDTO) {
        return await this.createAccount.execute(bankAccount);
    }
}