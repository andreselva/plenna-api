import { Injectable } from '@nestjs/common';
import { GatewaysFactory } from './gateways.factory';
import { Charge } from 'src/EntityModels/Charge';
import { IGatewayOperationResult } from 'src/Shared/interfaces/IGatewayOperationResult';

@Injectable()
export class GatewaysService {
    constructor(
        private readonly factory: GatewaysFactory
    ) {}

    async sendChargeToGateway(charge: Charge): Promise<IGatewayOperationResult> {
        const gateway = await this.factory.resolve(charge.gatewayId);
        return await gateway.registerCharge(charge);
    }

}
