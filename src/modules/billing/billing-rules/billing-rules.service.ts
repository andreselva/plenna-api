import { Injectable } from '@nestjs/common';
import { BillingRulesRepository } from './billing-rules.repository';

@Injectable()
export class BillingRulesService {
    constructor(
        private readonly repository: BillingRulesRepository
    ) {}

    async getBillingRuleByPaymentMethodAndCustomer(paymentMethodId: number, customerId: number) {
        const billingRules = await this.repository.loadBillingRuleByPaymentMethodAndCustomer(paymentMethodId, customerId);
        return billingRules;
    }

    async getDefaultBillingRuleByPaymentMethod(paymentMethodId: number) {
        const billingRules = await this.repository.loadDefaultBillingRuleByPaymentMethod(paymentMethodId);
        return billingRules;
    }

    async upsertDefaultBillingRuleByPaymentMethodCode(paymentMethodCode: string, gatewayId: number) {
        const billingRule = await this.repository.upsertDefaultBillingRuleByPaymentMethodCode(paymentMethodCode, gatewayId);
        return billingRule;
    }

    async getBillingRules() {
        const billingRules = await this.repository.loadAllBillingRules();
        return billingRules;
    }
}