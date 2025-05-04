import { Injectable } from "@nestjs/common";
import GetBankAccounts from "./UseCases/GetBankAccounts";
import CreateBankAccount from "./UseCases/CreateBankAccount";
import BankAccountDTO from "./DTOs/BankAccountDTO";
import DeleteBankAccount from "./UseCases/DeleteBankAccount";
import UpdateBankAccount from "./UseCases/UpdateBankAccount";

@Injectable()
export default class BankAccountsService {
    constructor(
        private readonly getAccounts: GetBankAccounts,
        private readonly createAccount: CreateBankAccount,
        private readonly deleteAccount: DeleteBankAccount,
        private readonly updateAccount: UpdateBankAccount,
    ) {}

    async getBankAccounts() {
        return await this.getAccounts.execute();
    }

    async createBankAccount(bankAccount: BankAccountDTO) {
        return await this.createAccount.execute(bankAccount);
    }

    async deleteBankAccount(id: string) {
        return await this.deleteAccount.execute(id);
    }

    async updateBankAccount(id: string, bankAccount: BankAccountDTO) {
        return await this.updateAccount.execute(id, bankAccount);
    }
}