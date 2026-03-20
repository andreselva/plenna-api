import { Controller, Get } from '@nestjs/common';
import { BankAccountDTO } from './DTOs/bank-account.dto';
import { Exception } from 'handlebars';
import { BankAccountsService } from './bank-accounts.service';

@Controller('bank-accounts')
export class BankAccountsController {
    constructor(
        private readonly service: BankAccountsService
    ) {}

    @Get()
    async getBankAccounts() {
        return []
    }

    async createBankAccount(dto: BankAccountDTO) {
        return 'ok'
    }

    async deleteBankAccount(dto: BankAccountDTO) {
        return 'ok'
    }

    async updateBankAccount(dto: BankAccountDTO) {
        if (dto.id === null || dto.id === undefined || dto.id <= 0) {
            throw new Exception(`Invalid id to update bank account`);
        }
        return 'ok';
    }
}
