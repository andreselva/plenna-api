import { Module } from '@nestjs/common';
import { BillingRulesService } from './billing-rules.service';
import { BillingRulesController } from './billing-rules.controller';
import { BillingRulesRepository } from './billing-rules.repository';

@Module({
  providers: [BillingRulesService, BillingRulesRepository],
  controllers: [BillingRulesController],
  exports: [BillingRulesService]
})
export class BillingRulesModule {}
