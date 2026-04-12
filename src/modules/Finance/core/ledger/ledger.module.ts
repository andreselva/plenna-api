import { Module } from '@nestjs/common';
import { LedgerEngine } from './ledger.engine';
import { LedgerRepository } from './ledger.repository';
import { LedgerResolver } from './ledger.resolver';
import { LedgerBuilder } from './ledger.builder';
import { LedgerSnapshotService } from './ledger-snapshot.service';
import { LedgerSnapshotRepository } from './ledger-snapshot.repository';

@Module({
  imports: [],
  providers: [
    LedgerEngine,
    LedgerRepository,
    LedgerResolver,
    LedgerBuilder,
    LedgerSnapshotService,
    LedgerSnapshotRepository,
  ],
  exports: [LedgerEngine, LedgerSnapshotService, LedgerSnapshotRepository],
})
export class LedgerModule {}