import { Injectable } from "@nestjs/common";
import { ChargesException } from "./exceptions/ChargesException";
import { BillingRule } from "src/EntityModels/BillingRule";
import { BillingRulesService } from "../billing-rules/billing-rules.service";
import { IChargeInput } from "src/Shared/interfaces/IChargeInput";

@Injectable()
export class ChargeResolver {
    constructor(
        private readonly billingRulesService: BillingRulesService
    ) {}

    async defineBillingRule(input: IChargeInput): Promise<BillingRule | null> {
        const customerBillingRules = await this.billingRulesService.getBillingRuleByPaymentMethodAndCustomer(
            input.paymentMethodId,
            input.customerId
        );

        if (Object.keys(customerBillingRules).length > 1) {
            throw new ChargesException('Multiple billing rules found for the same payment method and customer');
        } else if (Object.keys(customerBillingRules).length === 1 && customerBillingRules[0].gatewayId > 0) {
            return customerBillingRules[0];
        }

        const defaultBillingRules = await this.billingRulesService.getDefaultBillingRuleByPaymentMethod(
            input.paymentMethodId
        );

        if (Object.keys(defaultBillingRules).length > 1) {
            throw new ChargesException('Multiple default billing rules found for the same payment method');
        } else if (Object.keys(defaultBillingRules).length === 1 && defaultBillingRules[0].gatewayId > 0) {
            return defaultBillingRules[0];
        }

        return null;
    }
}