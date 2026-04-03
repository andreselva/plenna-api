import { Injectable } from "@nestjs/common";
import { ChargesException } from "./exceptions/ChargesException";
import { BillingRule } from "src/EntityModels/BillingRule";
import { BillingRulesService } from "../billing-rules/billing-rules.service";
import { IChargeInput } from "src/Shared/interfaces/IChargeInput";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import { Charge } from "src/EntityModels/Charge";
import { ChargesRepository } from "./charges.repository";

@Injectable()
export class ChargeResolver {
    constructor(
        private readonly billingRulesService: BillingRulesService,
        private readonly authContext: AuthContextService,
        private readonly repository: ChargesRepository
    ) {}

    async defineBillingRule(input: IChargeInput): Promise<any | null> {
        const customerBillingRules = await this.billingRulesService.getBillingRuleByPaymentMethodAndCustomer(
            input.paymentMethodId,
            input.customerId
        );

        if (customerBillingRules.length > 1) {
            throw new ChargesException(Charge.MULTIPLE_BILLING_RULES_ERROR_CUSTOMER);
        } else if (customerBillingRules.length === 1 && customerBillingRules[0].gatewayId > 0) {
            return customerBillingRules[0];
        }

        const defaultBillingRules = await this.billingRulesService.getDefaultBillingRuleByPaymentMethod(
            input.paymentMethodId
        );

        if (defaultBillingRules.length > 1) {
            throw new ChargesException(Charge.MULTIPLE_BILLING_RULES_ERROR);
        } else if (defaultBillingRules.length === 1 && defaultBillingRules[0].gatewayId > 0) {
            return defaultBillingRules[0];
        }

        return null;
    }

    async defineTitle(input: IChargeInput): Promise<string> {
        const customer = await this.repository.loadCustomer(input.customerId);

        if (!customer) {
            throw new ChargesException(Charge.CUSTOMER_NOT_FOUND_ERROR);
        }

        switch (input.entityType) {
            case 'REVENUE':
                return `Cobrança para ${customer.name} - Receita #${input.sequenceNumber || input.entityId}`;
            default:
                return `Cobrança para ${customer.name}`;
        }
    }

    getClientId() {
        return this.authContext.getClientId();
    }
}