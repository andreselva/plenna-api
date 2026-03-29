import { Injectable } from '@nestjs/common';
import { Charge } from 'src/EntityModels/Charge';
import { IGatewayOperationResult } from 'src/Shared/interfaces/IGatewayOperationResult';
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
}
