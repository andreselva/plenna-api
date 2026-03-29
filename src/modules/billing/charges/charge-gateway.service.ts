import { Injectable } from '@nestjs/common';
import { Charge } from 'src/EntityModels/Charge';
import { IGatewayOperationResult } from 'src/Shared/interfaces/IGatewayOperationResult';
import { GatewayIntegrationsService } from 'src/modules/integrations/gateways/gateways-integrations.service';

@Injectable()
export class ChargeGatewayService {
    constructor(
        private readonly gatewayIntegrationsService: GatewayIntegrationsService
    ) {}

    async sendCharge(charge: Charge): Promise<IGatewayOperationResult> {
        return await this.gatewayIntegrationsService.sendChargeToGateway(charge);
    }
}
