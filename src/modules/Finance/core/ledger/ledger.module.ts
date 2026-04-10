import { Module } from '@nestjs/common';
import { LedgerEngine } from './ledger.engine';
import { LedgerRepository } from './ledger.repository';
import { LedgerResolver } from './ledger.resolver';
import { LedgerBuilder } from './ledger.builder';

@Module({
  imports: [],
  providers: [
    LedgerEngine, 
    LedgerRepository, 
    LedgerResolver, 
    LedgerBuilder
  ],
  exports: [LedgerEngine]
})
export class LedgerModule {}