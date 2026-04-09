import { Charge } from "src/EntityModels/Charge";
import { GatewayEnum } from "src/enum/gateway.enum";
import { IGatewayOperationResult } from "./IGatewayOperationResult";
import { IGatewayStatusResult } from "./IGatewayStatusResult";
import { IWebhookParseResult } from "./IWebhookParseResult";

export interface IPaymentGateway {
    readonly gateway: GatewayEnum;
    registerCharge(charge: Charge): Promise<IGatewayOperationResult>;
    cancelCharge(charge: Charge): Promise<IGatewayOperationResult>;
    refundCharge(charge: Charge): Promise<IGatewayOperationResult>;
    getStatus(charge: Charge): Promise<IGatewayStatusResult>;
    parseWebhook(payload: unknown, headers: Record<string, string>): IWebhookParseResult;
}
