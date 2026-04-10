import { Module } from '@nestjs/common';
import { BillingRulesService } from './billing-rules.service';
import { BillingRulesController } from './billing-rules.controller';
import { BillingRulesRepository } from './billing-rules.repository';
import { PaymentMethodsRepository } from '../payment-methods/payment-methods.repository';

@Module({
  providers: [BillingRulesService, BillingRulesRepository, PaymentMethodsRepository],
  controllers: [BillingRulesController],
  exports: [BillingRulesService]
})
export class BillingRulesModule {}