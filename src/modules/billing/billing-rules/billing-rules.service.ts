import { Injectable } from '@nestjs/common';
import { BillingRulesRepository } from './billing-rules.repository';
import { BillingRule } from 'src/EntityModels/BillingRule';

@Injectable()
export class BillingRulesService {
    constructor(
        private readonly repository: BillingRulesRepository
    ) {}

    async getBillingRuleByPaymentMethodAndCustomer(paymentMethodId: number, customerId: number): Promise<BillingRule[]> {
        return await this.repository.loadBillingRuleByPaymentMethodAndCustomer(paymentMethodId, customerId);
    }

    async getDefaultBillingRuleByPaymentMethod(paymentMethodId: number): Promise<BillingRule[]> {
        return await this.repository.loadDefaultBillingRuleByPaymentMethod(paymentMethodId);
    }

    async getBillingRules(): Promise<BillingRule[]> {
        return await this.repository.loadAllBillingRules();
    }
}
