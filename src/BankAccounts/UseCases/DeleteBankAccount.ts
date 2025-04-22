import { Dependencies, Injectable } from "@nestjs/common";
import BankAccountsRepository from "../BankAccountsRepository";

@Injectable()
@Dependencies(BankAccountsRepository)
export default class DeleteBankAccount {
    constructor(
        private readonly repository: BankAccountsRepository
    ) { }

    async execute(id: string) {
        if (!id) {
            throw new Error("ID is required to delete a bank account.");
        }
        return await this.repository.deleteBankAccount(Number(id));
    }
}