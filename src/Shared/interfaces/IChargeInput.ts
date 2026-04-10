import { ChargeEntityType } from "src/enum/charge-entity-type.enum";

export interface IChargeInput {
    entityId: number;
    entityType: ChargeEntityType;
    amount: number;
    paymentMethodId: number;
    customerId: number;
    accountId: number;
    sequenceNumber?: string;
}