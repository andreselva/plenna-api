import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { BankAccountDTO } from './DTOs/bank-account.dto';
import { Exception } from 'handlebars';
import { BankAccountsService } from './bank-accounts.service';
import { HelperFunctions } from 'src/Shared/Utils/HelperFunctions';

@Controller('bank-accounts')
export class BankAccountsController {
    constructor(
        private readonly service: BankAccountsService
    ) {}

    @Get()
    async getBankAccounts() {
        return await this.service.list();
    }

    @Post()
    async createBankAccount(@Body() dto: BankAccountDTO) {
        return await this.service.saveBankAccount(dto);
    }
    
    @Put(':id')
    async inactive(@Param('id') id: string) {
        return await this.service.inactive(Number(id));
    }

    @Put(':id')
    async updateBankAccount(@Param('id') id: string, @Body() dto: BankAccountDTO) {
        if (!HelperFunctions.isNullable(Number(id), true, true) && Number(id) > 0) {
            dto.id = Number(id);
            return await this.service.saveBankAccount(dto);
        }
        throw new Exception(`Invalid id to update bank account`);
    }
}
