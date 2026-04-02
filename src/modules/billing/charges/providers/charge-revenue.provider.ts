import { Injectable } from "@nestjs/common";
import Revenue from "src/EntityModels/Revenue";
import { ChargeEntityType } from "src/enum/charge-entity-type.enum";
import { IChargeProvider } from "src/Shared/interfaces/IChargeProvider";
import { ChargesRepository } from "../charges.repository";
import { IChargeInput } from "src/Shared/interfaces/IChargeInput";
import { ChargesException } from "../exceptions/ChargesException";

@Injectable()
export class ChargeRevenueProvider implements IChargeProvider {
    readonly entityType: ChargeEntityType = ChargeEntityType.REVENUE;
    constructor(
        private readonly repository: ChargesRepository
    ) {}

    async load(entityId: number): Promise<IChargeInput> {
        const revenue = await this.repository.loadRevenue(entityId);
        if (!revenue) {
            throw new ChargesException('Revenue not found');
        }

        return {
            entityId: revenue.id,
            entityType: this.entityType,
            amount: Number(revenue.value),
            paymentMethodId: revenue.paymentMethodId,
            customerId: revenue.customerId
        } satisfies IChargeInput;

    }

}