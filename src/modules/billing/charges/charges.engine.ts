import { Injectable, Logger } from "@nestjs/common";
import { ChargesException } from "./exceptions/ChargesException";
import { Charge } from "src/EntityModels/Charge";
import { ChargeStatus } from "src/enum/charge-status.enum";
import { ChargeResolver } from "./charge.resolver";
import { IChargeInput } from "src/Shared/interfaces/IChargeInput";
import { HelperFunctions } from "src/Shared/Utils/HelperFunctions";
import { ChargeAlreadyProcessedException } from "./exceptions/ChargeAlreadyProcessedException";

@Injectable()
export class ChargesEngine {
    private readonly logger: Logger = new Logger(ChargesEngine.name);

    constructor(
        private readonly resolver: ChargeResolver,
    ) {}

    async process(input: IChargeInput): Promise<Charge> {
        this.validate(input);

        try {
            await this.resolver.saveEventProcessing(input);
        } catch (error) {
            if (HelperFunctions.isDuplicateKeyError(error)) {
                this.logger.error(`Error saving charge processing for entityId ${input.entityId} and entityType ${input.entityType}: ${error.message}`);
                throw new ChargeAlreadyProcessedException(input.entityId, input.entityType);
            }
            throw error;
        }

        const charge = new Charge();
        charge.id = 0;
        charge.entityId = input.entityId;
        charge.customerId = input.customerId;
        charge.amount = input.amount;
        charge.entityType = input.entityType;
        charge.status = ChargeStatus.DRAFT;
        charge.title = await this.resolver.defineTitle(input);

        const bRule = await this.resolver.defineBillingRule(input);
        if (bRule === null) {
            this.logger.warn(`No billing rule found for input with id ${input.entityId}`);
        }

        if (bRule !== null) {
            charge.billingRuleId = bRule.id;
            charge.gatewayId = bRule.gatewayId;
            charge.gateway = bRule.gateway.gateway;
        }
        
        return charge;
    }

    validate(input: IChargeInput) {
        if (input.amount <= 0) {
            throw new ChargesException(Charge.INVALID_AMOUNT_ERROR);
        } else if (input.paymentMethodId <= 0) {
            throw new ChargesException(Charge.INVALID_PAYMENT_METHOD_ERROR);
        } else if (input.customerId <= 0) {
            throw new ChargesException(Charge.INVALID_CUSTOMER_ERROR);
        } else if (input.entityId <= 0) {
            throw new ChargesException(Charge.INVALID_ENTITY_ID_ERROR);
        } else if (!input.entityType) {
            throw new ChargesException(Charge.ENTITY_TYPE_REQUIRED_ERROR);
        }
    }
}
