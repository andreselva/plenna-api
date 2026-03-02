import { Module } from '@nestjs/common';
import { FinancialEventsService } from './financial-events.service';
import { RedisModule } from '../redis/redis.module';
import { FinancialEventsRepository } from './financial-events.repository';

@Module({
  imports: [RedisModule],
  providers: [FinancialEventsService, FinancialEventsRepository],
  exports: [FinancialEventsService]
})
export class FinancialEventsModule {}
