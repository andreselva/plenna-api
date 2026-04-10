import { ChargeStatus } from "src/enum/charge-status.enum";

export interface IGatewayStatusResult {
    success: boolean;
    status: ChargeStatus;
    externalId?: string;
    paidAt?: string;
    raw?: unknown;
}
