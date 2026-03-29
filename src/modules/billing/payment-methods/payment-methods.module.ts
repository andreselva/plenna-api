import { Module } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsController } from './payment-methods.controller';
import { PaymentMethodsRepository } from './payment-methods.repository';

@Module({
  providers: [PaymentMethodsService, PaymentMethodsRepository],
  controllers: [PaymentMethodsController]
})
export class PaymentMethodsModule {}
