import { ChargeStatus } from "src/enum/charge-status.enum";

export interface IWebhookParseResult {
    externalId: string;
    newStatus: ChargeStatus;
    paidAt?: string;
}
