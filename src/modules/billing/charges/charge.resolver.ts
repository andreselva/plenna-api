import { Injectable } from "@nestjs/common";
import { ChargesException } from "./exceptions/ChargesException";
import { BillingRulesService } from "../billing-rules/billing-rules.service";
import { IChargeInput } from "src/Shared/interfaces/IChargeInput";
import { Charge } from "src/EntityModels/Charge";
import { ChargesRepository } from "./charges.repository";
import { ChargeProcessing } from "src/EntityModels/ChargeProcessing";
import { ChargeEntityType } from "src/enum/charge-entity-type.enum";
import DateHelper from "src/Shared/Utils/DateHelper";

@Injectable()
export class ChargeResolver {
    constructor(
        private readonly billingRulesService: BillingRulesService,
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

        if (customer === null || customer === undefined) {
            throw new ChargesException(Charge.CUSTOMER_NOT_FOUND_ERROR);
        }

        switch (input.entityType) {
            case ChargeEntityType.REVENUE:
                return `Cobrança para ${customer.name} - #${input.sequenceNumber || input.entityId}`;
            default:
                return `Cobrança para ${customer.name}`;
        }
    }

    async saveEventProcessing(input: IChargeInput): Promise<void> {
        const processing = new ChargeProcessing();
        processing.id = 0;
        processing.entityId = input.entityId;
        processing.entityType = input.entityType;
        processing.date = DateHelper.getCurrentDate();
        await this.repository.saveProcessing(processing);
    }
}