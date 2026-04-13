import { Module } from '@nestjs/common';
import { FinancialEventsService } from './financial-events.service';
import { FinancialEventsRepository } from './financial-events.repository';
import { RedisModule } from 'src/modules/redis/redis.module';
import { LedgerModule } from '../ledger/ledger.module';
import { LedgerBuildModule } from '../ledger-build/ledger-build.module';

@Module({
  imports: [RedisModule, LedgerModule, LedgerBuildModule],
  providers: [FinancialEventsService, FinancialEventsRepository],
  exports: [FinancialEventsService]
})
export class FinancialEventsModule {}
