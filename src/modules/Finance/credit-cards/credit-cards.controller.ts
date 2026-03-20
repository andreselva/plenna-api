import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from "@nestjs/common";
import BankAccountsService from "./credit-cards.service";
import CreditCardDTO from "./DTOs/credit-card.dto";

@Controller("credit-cards")
export default class CreditCardsController {
    constructor(
        private readonly service: BankAccountsService,
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async get() {
        return await this.service.getCreditCards();
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() creditCard: CreditCardDTO) {
        return await this.service.createCreditCard(creditCard);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async delete(@Param('id') id: string) {
        return await this.service.deleteCreditCard(id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async update(@Param('id') id: string, @Body() creditCard: CreditCardDTO) {
        return await this.service.updateCreditCard(id, creditCard);
    }
}