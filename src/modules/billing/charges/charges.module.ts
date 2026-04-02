import { Module } from '@nestjs/common';
import { ChargesController } from './charges.controller';
import { ChargesService } from './charges.service';
import { ChargesRepository } from './charges.repository';
import { BillingRulesModule } from '../billing-rules/billing-rules.module';
import { ChargesEngine } from './charges.engine';
import { ChargeGatewayService } from './charge-gateway.service';
import { IntegrationsModule } from 'src/modules/integrations/integrations.module';
import { ChargeResolver } from './charge.resolver';
import { CHARGE_PROVIDERS_TOKEN } from './constants/charge-providers.token';
import { ChargeRevenueProvider } from './providers/charge-revenue.provider';
import { ChargesFactory } from './charges.factory';

@Module({
  controllers: [ChargesController],
  providers: [
    ChargesService, 
    ChargesRepository, 
    ChargesEngine, 
    ChargeGatewayService, 
    ChargeResolver,
    ChargeRevenueProvider,
    ChargesFactory,
    {
      provide: CHARGE_PROVIDERS_TOKEN,
      useFactory: (
        chargeRevenueProvider: ChargeRevenueProvider
      ) => [
        chargeRevenueProvider
      ],

      inject: [ChargeRevenueProvider],
    }
  ],
  imports: [BillingRulesModule, IntegrationsModule]
})
export class ChargesModule {}
