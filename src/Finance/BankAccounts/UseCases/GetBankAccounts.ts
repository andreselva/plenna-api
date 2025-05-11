import { Injectable } from "@nestjs/common";
import BankAccountsRepository from "../BankAccountsRepository";

@Injectable()
export default class GetBankAccounts {
    constructor(
        private readonly repository: BankAccountsRepository
    ) { }

    async execute() {
        return await this.repository.getBankAccounts();
    }
}