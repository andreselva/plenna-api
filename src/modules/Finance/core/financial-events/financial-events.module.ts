import { Module } from '@nestjs/common';
import { FinancialEventsService } from './financial-events.service';
import { FinancialEventsRepository } from './financial-events.repository';
import { RedisModule } from 'src/modules/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [FinancialEventsService, FinancialEventsRepository],
  exports: [FinancialEventsService]
})
export class FinancialEventsModule {}
