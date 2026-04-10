import { Module } from '@nestjs/common';
import { GatewaysIntegrationsRepository } from './gateway-integrations.repository';
import { GatewayIntegrationsService } from './gateways-integrations.service';
import { PagarmePaymentGateway } from './providers/pagar.me/pagarme-payment-gateway';
import { PAYMENT_GATEWAY_PROVIDERS } from './constants/payment-gateway-provider.token';
import { GatewaysIntegrationsFactory } from './gateways-integrations.factory';

@Module({
  providers: [
    PagarmePaymentGateway,
    GatewaysIntegrationsRepository,
    GatewayIntegrationsService,
    GatewaysIntegrationsFactory,
    {
      provide: PAYMENT_GATEWAY_PROVIDERS,

      useFactory: (
        pagarmeGateway: PagarmePaymentGateway
      ) => [
        pagarmeGateway
      ],
      
      inject: [PagarmePaymentGateway],
    },
],
  controllers: [],
  exports: [GatewayIntegrationsService]
})
export class GatewaysIntegrationsModule {}
