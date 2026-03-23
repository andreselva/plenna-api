import { Module } from '@nestjs/common';
import { BankAccountsController } from './bank-accounts.controller';
import { BankAccountsService } from './bank-accounts.service';
import { BankAccountsRepository } from './bank-accounts.repository';
import { FinancialEventsModule } from '../financial-events/financial-events.module';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  controllers: [BankAccountsController],
  providers: [BankAccountsService, BankAccountsRepository],
  imports: [FinancialEventsModule, LedgerModule]
})
export class BankAccountsModule {}
