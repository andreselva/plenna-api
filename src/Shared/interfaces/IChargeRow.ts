import { ChargeEntityType } from "src/enum/charge-entity-type.enum";
import { ChargeStatus } from "src/enum/charge-status.enum";

export interface IChargeRow {
    id: number;
    clientId: number;
    entityId: number;
    entityType: ChargeEntityType;
    gatewayId: number;
    billingRuleId: number;
    customerId: number;
    status: ChargeStatus;
    amount: number;
    qrcode: string;
    externalId: string;
    paymentLink: string;
    paymentAt: string;
    title: string;
    gateway: string;
}