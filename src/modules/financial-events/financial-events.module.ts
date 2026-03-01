import { Module } from '@nestjs/common';
import { FinancialEventsController } from './financial-events.controller';
import { FinancialEventsService } from './financial-events.service';

@Module({
  controllers: [FinancialEventsController],
  providers: [FinancialEventsService]
})
export class FinancialEventsModule {}
