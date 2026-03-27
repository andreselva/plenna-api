import { Controller, Get } from '@nestjs/common';

@Controller('payment-methods')
export class PaymentMethodsController {
    @Get()
    async getPaymentMethods() {

    }
}
