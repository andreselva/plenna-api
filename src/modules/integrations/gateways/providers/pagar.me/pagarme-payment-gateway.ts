import { Injectable } from "@nestjs/common";
import { Charge } from "src/EntityModels/Charge";
import { IPaymentGateway } from "src/Shared/interfaces/IPaymentGateway";
import { ChargeStatus } from "src/enum/charge-status.enum";
import { GatewayEnum } from "src/enum/gateway.enum";
import { IGatewayOperationResult } from "src/Shared/interfaces/IGatewayOperationResult";
import { IGatewayStatusResult } from "src/Shared/interfaces/IGatewayStatusResult";
import { IWebhookParseResult } from "src/Shared/interfaces/IWebhookParseResult";
import DateHelper from "src/Shared/Utils/DateHelper";

@Injectable()
export class PagarmePaymentGateway implements IPaymentGateway {
    readonly gateway = GatewayEnum.PAGAR_ME;

    async registerCharge(charge: Charge): Promise<IGatewayOperationResult> {
        return {
            success: true,
            status: ChargeStatus.PROCESSING,
            externalId: `pagarme_${charge.id}`,
            paymentLink: `https://pagar.me/checkout/${charge.id}`,
            qrcode: `https://pagar.me/qrcode/${charge.id}`,
            paidAt: DateHelper.getCurrentDate(),
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

    parseWebhook(payload: unknown, headers: Record<string, string>): IWebhookParseResult {
        const body = payload as Record<string, any>;

        const statusMap: Record<string, ChargeStatus> = {
            'paid': ChargeStatus.PAID,
            'payment_failed': ChargeStatus.FAILED,
            'canceled': ChargeStatus.CANCELED,
            'waiting_payment': ChargeStatus.AWAITING_PAYMENT,
            'processing': ChargeStatus.PROCESSING,
        };

        const rawStatus = body?.order?.status ?? body?.charge?.status ?? '';
        const newStatus = statusMap[rawStatus] ?? ChargeStatus.PROCESSING;
        const externalId = body?.order?.id ?? body?.charge?.id ?? '';
        const paidAt = body?.order?.paid_at ?? body?.charge?.paid_at ?? undefined;

        return { externalId, newStatus, paidAt };
    }
}
