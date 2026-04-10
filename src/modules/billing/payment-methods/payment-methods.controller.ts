import { Body, Controller, Get, Param, Put } from '@nestjs/common';
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

    @Put('/:code/status')
    async updatePaymentMethod(
        @Param('code') code: string,
        @Body() body: { isActive?: boolean }
    ) {
        return await this.service.updatePaymentMethod(code, !!body?.isActive);
    }

    @Get('/client')
    async getPaymentMethodByClient() {
        return await this.service.getpaymentMethodByClient();
    }
}