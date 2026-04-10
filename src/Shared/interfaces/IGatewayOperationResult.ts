import { ChargeStatus } from "src/enum/charge-status.enum";

export interface IGatewayOperationResult {
    success: boolean;
    status: ChargeStatus;
    externalId?: string;
    paymentLink?: string;
    qrcode?: string;
    paidAt?: string;
    raw?: unknown;
}
