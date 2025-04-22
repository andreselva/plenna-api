import { Body, Controller, Dependencies, Get, Post } from "@nestjs/common";
import BankAccountDTO from "./DTOs/BankAccountDTO";
import BankAccountsService from "./BankAccountsServices";


@Controller("bank-accounts")
@Dependencies(BankAccountsService)
export default class BankAccountsController {
    constructor(
        private readonly service: BankAccountsService,
    ) { }

    @Get()
    async getBankAccounts() {
        return await this.service.getBankAccounts();
    }

    @Post()
    async createBankAccount(@Body() bankAccount: BankAccountDTO) {
        return await this.service.createBankAccount(bankAccount);
    }
}