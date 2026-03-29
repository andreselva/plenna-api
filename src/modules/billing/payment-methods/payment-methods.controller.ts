import { Controller, Get, Param, Put } from '@nestjs/common';
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

    @Put('/:id/status')
    async updatePaymentMethod(@Param('id') id: number) {
        return await this.service.updatePaymentMethod(id);
    }

    @Get('/client')
    async getPaymentMethodByClient() {
        return await this.service.getpaymentMethodByClient();
    }
}
