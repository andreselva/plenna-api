import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { GatewaysModule } from './gateways/gateways.module';
import { BillingRulesModule } from './billing-rules/billing-rules.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { ChargesModule } from './charges/charges.module';

@Module({
  providers: [BillingService],
  controllers: [BillingController],
  imports: [GatewaysModule, BillingRulesModule, PaymentMethodsModule, ChargesModule]
})
export class BillingModule {}
