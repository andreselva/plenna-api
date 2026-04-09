import { Module } from '@nestjs/common';
import { ChargesController } from './charges.controller';
import { ChargesService } from './charges.service';
import { ChargesRepository } from './charges.repository';
import { BillingRulesModule } from '../billing-rules/billing-rules.module';
import { ChargesEngine } from './charges.engine';
import { ChargeGatewayService } from './charge-gateway.service';
import { IntegrationsModule } from 'src/modules/integrations/integrations.module';
import { FinancialEventsModule } from 'src/modules/Finance/core/financial-events/financial-events.module';
import { ChargeResolver } from './charge.resolver';
import { CHARGE_PROVIDERS_TOKEN } from './constants/charge-providers.token';
import { ChargeRevenueProvider } from './providers/charge-revenue.provider';
import { ChargesFactory } from './factorys/charges.factory';
import { ChargeEventsService } from './events/charge-events.service';
import { ChargeEventsRepository } from './events/charge-events.repository';
import { ChargesWebhookController } from './webhooks/charges-webhook.controller';
import { ChargeExpirationService } from './expiration/charge-expiration.service';

@Module({
  controllers: [ChargesController, ChargesWebhookController],
  providers: [
    ChargesService,
    ChargesRepository,
    ChargesEngine,
    ChargeGatewayService,
    ChargeResolver,
    ChargeRevenueProvider,
    ChargesFactory,
    ChargeEventsService,
    ChargeEventsRepository,
    ChargeExpirationService,
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
  imports: [BillingRulesModule, IntegrationsModule, FinancialEventsModule],
  exports: [ChargesService, ChargeExpirationService]
})
export class ChargesModule {}
