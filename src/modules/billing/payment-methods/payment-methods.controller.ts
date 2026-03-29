import { Controller, Get } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';

@Controller('payment-methods')
export class PaymentMethodsController {
    constructor(
        private readonly service: PaymentMethodsService
    ) {}

    @Get()
    async getPaymentMethods() {
        return await this.service.getPaymentMethods();
    }
}
