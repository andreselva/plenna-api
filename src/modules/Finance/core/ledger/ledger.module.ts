import { Module } from '@nestjs/common';
import { LedgerEngine } from './ledger.engine';
import { LedgerRepository } from './ledger.repository';

@Module({
  imports: [],
  providers: [LedgerEngine, LedgerRepository],
  exports: [LedgerEngine]
})
export class LedgerModule {}