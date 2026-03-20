import { Injectable } from '@nestjs/common';
import { BankAccountsRepository } from './bank-accounts.repository';
import { BankAccountDTO } from './DTOs/bank-account.dto';
import { BankAccount } from 'src/EntityModels/BankAccount';
import { HelperFunctions } from 'src/Shared/Utils/HelperFunctions';

@Injectable()
export class BankAccountsService {
    constructor(
        private readonly repository: BankAccountsRepository
    ) {}

    async list() {
        const result = await this.repository.listBankAccounts();
        const bankAccounts = result.map(b => {
            return HelperFunctions.cleanNullables(b);
        });
        return { bankAccounts: bankAccounts };
    }

    async saveBankAccount(dto: BankAccountDTO) {
        const entity = BankAccount.fromDTO(dto);
        await this.repository.save(entity, true);
    }
}
