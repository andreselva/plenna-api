import { Injectable, Logger } from "@nestjs/common";
import { Expense } from "src/EntityModels/Expense";
import { BillingRulesService } from "../billing-rules/billing-rules.service";
import { ChargesException } from "./exceptions/ChargesException";
import { BillingRule } from "src/EntityModels/BillingRule";
import { Charge } from "src/EntityModels/Charge";
import { ChargeStatus } from "src/enum/charge-status.enum";

@Injectable()
export class ChargesEngine {
    private readonly logger: Logger = new Logger(ChargesEngine.name);

    constructor(
        private readonly billingRulesService: BillingRulesService
    ) {}
    
    async process(expense: Expense): Promise<Charge> {
        this.validate(expense);
        
        const charge = new Charge();
        charge.expenseId = expense.id;
        charge.customerId = expense.customerId;
        charge.amount = expense.value;
        charge.status = ChargeStatus.DRAFT;

        const bRule = await this.defineBillingRule(expense);
        if (bRule === null) {
            this.logger.warn(`No billing rule found for expense with id ${expense.id}`);
        }

        if (bRule !== null) {
            charge.billingRuleId = bRule.id;
            charge.gatewayId = bRule.gatewayId;
        }
        
        return charge;
    }

    async validate(expense: Expense) {
        if (expense.value <= 0) {
            throw new ChargesException('Expense amount must be greater than 0');
        } else if (expense.paymentMethodId <= 0) {
            throw new ChargesException('Invalid payment method');
        } else if (expense.customerId <= 0) {
            throw new ChargesException('Invalid customer');
        }
    }

    async defineBillingRule(expense: Expense): Promise<BillingRule | null> {
        const customerBillingRules = await this.billingRulesService.getBillingRuleByPaymentMethodAndCustomer(
            expense.paymentMethodId,
            expense.customerId
        );

        if (customerBillingRules.length > 1) {
            throw new ChargesException('Multiple billing rules found for the same payment method and customer');
        } else if (customerBillingRules.length === 1 && customerBillingRules[0].gatewayId > 0) {
            return customerBillingRules[0];
        }

        const defaultBillingRules = await this.billingRulesService.getDefaultBillingRuleByPaymentMethod(
            expense.paymentMethodId
        );

        if (defaultBillingRules.length > 1) {
            throw new ChargesException('Multiple default billing rules found for the same payment method');
        } else if (defaultBillingRules.length === 1 && defaultBillingRules[0].gatewayId > 0) {
            return defaultBillingRules[0];
        }

        return null;
    }
}
