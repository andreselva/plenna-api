import { Module } from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { GatewaysController } from './gateways.controller';
import { GatewaysRepository } from './gateways.repository';
import { GatewaysFactory } from './gateways.factory';
import { PagarmePaymentGateway } from './providers/pagar.me/pagarme-payment-gateway';
import { PAYMENT_GATEWAY_PROVIDERS } from './constants/payment-gateway-provider.token';

@Module({
  providers: [
    GatewaysService,
    GatewaysRepository,
    GatewaysFactory,
    PagarmePaymentGateway,
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
  controllers: [GatewaysController],
  exports: [GatewaysService]
})
export class GatewaysModule {}
