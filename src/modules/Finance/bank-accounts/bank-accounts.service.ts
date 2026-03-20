import { Injectable } from '@nestjs/common';
import { BankAccountsRepository } from './bank-accounts.repository';

@Injectable()
export class BankAccountsService {
    constructor(
        private readonly repository: BankAccountsRepository
    ) {}
}
