import { Module } from '@nestjs/common';
import { BankAccountsController } from './bank-accounts.controller';
import { BankAccountsService } from './bank-accounts.service';
import { BankAccountsRepository } from './bank-accounts.repository';

@Module({
  controllers: [BankAccountsController],
  providers: [BankAccountsService, BankAccountsRepository]
})
export class BankAccountsModule {}
