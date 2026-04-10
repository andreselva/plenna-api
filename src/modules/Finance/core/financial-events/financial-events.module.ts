import { Module } from '@nestjs/common';
import { FinancialEventsService } from './financial-events.service';
import { FinancialEventsRepository } from './financial-events.repository';
import { RedisModule } from 'src/modules/redis/redis.module';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [RedisModule, LedgerModule],
  providers: [FinancialEventsService, FinancialEventsRepository],
  exports: [FinancialEventsService]
})
export class FinancialEventsModule {}
