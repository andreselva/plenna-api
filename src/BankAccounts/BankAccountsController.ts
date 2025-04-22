import { Body, Controller, Delete, Dependencies, Get, Param, Post, Put } from "@nestjs/common";
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

    @Delete(':id')
    async deleteBankAccount(@Param('id') id: string) {
        return await this.service.deleteBankAccount(id);
    }

    @Put(':id')
    async updateBankAccount(@Param('id') id: string, @Body() bankAccount: BankAccountDTO) {
        return await this.service.updateBankAccount(id, bankAccount);
    }
}