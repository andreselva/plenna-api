import { ChargeStatus } from "src/enum/charge-status.enum";

export interface IChargeRow {
    id: number;
    clientId: number;
    expenseId: number;
    gatewayId: number;
    billingRuleId: number;
    customerId: number;
    status: ChargeStatus;
    amount: number;
    qrcode: string;
    externalId: string;
    paymentLink: string;
    paymentAt: string;
}