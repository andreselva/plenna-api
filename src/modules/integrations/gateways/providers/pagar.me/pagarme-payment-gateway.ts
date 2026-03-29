import { Injectable } from "@nestjs/common";
import { Charge } from "src/EntityModels/Charge";
import { IPaymentGateway } from "src/Shared/interfaces/IPaymentGateway";
import { ChargeStatus } from "src/enum/charge-status.enum";
import { GatewayEnum } from "src/enum/gateway.enum";
import { IGatewayOperationResult } from "src/Shared/interfaces/IGatewayOperationResult";
import { IGatewayStatusResult } from "src/Shared/interfaces/IGatewayStatusResult";

@Injectable()
export class PagarmePaymentGateway implements IPaymentGateway {
    readonly gateway = GatewayEnum.PAGAR_ME;

    async registerCharge(charge: Charge): Promise<IGatewayOperationResult> {
        return {
            success: true,
            status: ChargeStatus.PROCESSING,
            raw: { chargeId: charge.id }
        };
    }

    async cancelCharge(charge: Charge): Promise<IGatewayOperationResult> {
        return {
            success: true,
            status: ChargeStatus.CANCELED,
            raw: { chargeId: charge.id }
        };
    }

    async refundCharge(charge: Charge): Promise<IGatewayOperationResult> {
        return {
            success: true,
            status: ChargeStatus.CANCELED,
            raw: { chargeId: charge.id }
        };
    }

    async getStatus(charge: Charge): Promise<IGatewayStatusResult> {
        return {
            success: true,
            status: ChargeStatus.PROCESSING,
            externalId: charge.externalId,
            raw: { chargeId: charge.id }
        };
    }
}
