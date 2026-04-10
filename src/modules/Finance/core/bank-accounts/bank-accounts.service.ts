import { Injectable } from '@nestjs/common';
import { BankAccountsRepository } from './bank-accounts.repository';
import { BankAccountDTO } from './DTOs/bank-account.dto';
import { BankAccount } from 'src/EntityModels/BankAccount';
import { HelperFunctions } from 'src/Shared/Utils/HelperFunctions';
import { FinancialEventsService } from '../financial-events/financial-events.service';
import { FinancialEventsEnum } from 'src/enum/financial-events.enum';
import { PaymentType } from '../../Payment/Types/payment.type';
import { LedgerEngine } from '../ledger/ledger.engine';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';

@Injectable()
export class BankAccountsService {
    constructor(
        private readonly repository: BankAccountsRepository,
        private readonly financialEventsService: FinancialEventsService,
        private readonly ledgerEngine: LedgerEngine,
        private readonly database: MySQLDatabase
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
        return this.database.transaction(async () => {
            const saved = await this.repository.save(entity, true);
            entity.id = saved.insertId;
            await this.financialEventsService.register({
                accountId: entity.id,
                type: FinancialEventsEnum.OPENING_BALANCE,
                amount: !HelperFunctions.isNullable(entity.initialBalance) ? entity.initialBalance : 0,
                referenceType: PaymentType.ACCOUNT_OPENING,
                referenceId: entity.id
            })
        })
    }

    async updateBankAccount(dto: BankAccountDTO) {
        const entity = BankAccount.fromDTO(dto);
        entity.addIgnoredProperties(['initialBalance', 'currentBalance']);
        return await this.repository.save(entity, true);
    }

    async inactive(id: number) {
        return await this.repository.inactiveBankAccount(id);
    }
}
