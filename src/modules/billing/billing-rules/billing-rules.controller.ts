import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { BillingRulesService } from './billing-rules.service';

@Controller('billing-rules')
export class BillingRulesController {
    constructor(
        private readonly service: BillingRulesService
    ) {}

    @Get('/payment-method/:paymentMethodId/customer/:customerId')
    async getBillingRuleByPaymentMethodAndCustomer(
        @Param('paymentMethodId') paymentMethodId: string,
        @Param('customerId') customerId: string
    ) {
        return await this.service.getBillingRuleByPaymentMethodAndCustomer(Number(paymentMethodId), Number(customerId));
    }

    @Get('/payment-method/:paymentMethodId/default')
    async getDefaultBillingRuleByPaymentMethod(@Param('paymentMethodId') paymentMethodId: string) {
        return await this.service.getDefaultBillingRuleByPaymentMethod(Number(paymentMethodId));
    }

    @Put('/payment-methods/:paymentMethodCode')
    async upsertDefaultBillingRuleByPaymentMethodCode(
        @Param('paymentMethodCode') paymentMethodCode: string,
        @Body() body: { gatewayId: number }
    ) {
        return await this.service.upsertDefaultBillingRuleByPaymentMethodCode(paymentMethodCode, body.gatewayId);
    }

    @Get()
    async getBillingRules() {
        return await this.service.getBillingRules();
    }
}