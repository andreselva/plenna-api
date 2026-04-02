import { Injectable, Logger } from "@nestjs/common";
import { ChargesException } from "./exceptions/ChargesException";
import { Charge } from "src/EntityModels/Charge";
import { ChargeStatus } from "src/enum/charge-status.enum";
import { ChargeResolver } from "./charge.resolver";
import { IChargeInput } from "src/Shared/interfaces/IChargeInput";

@Injectable()
export class ChargesEngine {
    private readonly logger: Logger = new Logger(ChargesEngine.name);

    constructor(
        private readonly resolver: ChargeResolver
    ) {}

    async process(input: IChargeInput): Promise<Charge> {
        this.validate(input);

        const charge = new Charge();
        charge.entityId = input.entityId;
        charge.customerId = input.customerId;
        charge.amount = input.amount;
        charge.status = ChargeStatus.DRAFT;

        const bRule = await this.resolver.defineBillingRule(input);
        if (bRule === null) {
            this.logger.warn(`No billing rule found for input with id ${input.entityId}`);
        }

        if (bRule !== null) {
            charge.billingRuleId = bRule.id;
            charge.gatewayId = bRule.gatewayId;
        }
        
        return charge;
    }

    validate(input: IChargeInput) {
        if (input.amount <= 0) {
            throw new ChargesException('Amount must be greater than 0');
        } else if (input.paymentMethodId <= 0) {
            throw new ChargesException('Invalid payment method');
        } else if (input.customerId <= 0) {
            throw new ChargesException('Invalid customer');
        }
    }
}
