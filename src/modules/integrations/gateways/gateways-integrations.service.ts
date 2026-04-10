import { Injectable } from '@nestjs/common';
import { Charge } from 'src/EntityModels/Charge';
import { IGatewayOperationResult } from 'src/Shared/interfaces/IGatewayOperationResult';
import { IWebhookParseResult } from 'src/Shared/interfaces/IWebhookParseResult';
import { GatewaysIntegrationsFactory } from './gateways-integrations.factory';

@Injectable()
export class GatewayIntegrationsService {
    constructor(
        private readonly factory: GatewaysIntegrationsFactory
    ) {}

    async sendChargeToGateway(charge: Charge): Promise<IGatewayOperationResult> {
        const gateway = await this.factory.resolve(charge.gatewayId);
        return await gateway.registerCharge(charge);
    }

    async cancelCharge(charge: Charge): Promise<IGatewayOperationResult> {
        const gateway = await this.factory.resolve(charge.gatewayId);
        return await gateway.cancelCharge(charge);
    }

    async refundCharge(charge: Charge): Promise<IGatewayOperationResult> {
        const gateway = await this.factory.resolve(charge.gatewayId);
        return await gateway.refundCharge(charge);
    }

    parseWebhook(gatewayName: string, payload: unknown, headers: Record<string, string>): IWebhookParseResult {
        const gateway = this.factory.resolveByGatewayName(gatewayName);
        return gateway.parseWebhook(payload, headers);
    }
}
