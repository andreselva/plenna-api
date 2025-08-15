import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common";
import BankAccountDTO from "./DTOs/BankAccountDTO";
import BankAccountsService from "./BankAccountsServices";

@Controller("bank-accounts")
export default class BankAccountsController {
    constructor(
        private readonly service: BankAccountsService,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getBankAccounts() {
        return await this.service.getBankAccounts();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createBankAccount(@Body() bankAccount: BankAccountDTO) {
        return await this.service.createBankAccount(bankAccount);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteBankAccount(@Param('id') id: string) {
        return await this.service.deleteBankAccount(id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async updateBankAccount(@Param('id') id: string, @Body() bankAccount: BankAccountDTO) {
        return await this.service.updateBankAccount(id, bankAccount);
    }
}