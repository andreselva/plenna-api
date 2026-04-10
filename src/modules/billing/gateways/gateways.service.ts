import { Injectable } from '@nestjs/common';
import { GatewaysRepository } from './gateways.repository';
import { GatewayConfigDTO } from './dtos/gateway.dto';
import { GatewayConfigs } from 'src/EntityModels/GatewayConfigs';

@Injectable()
export class GatewaysService {
    constructor(
        private readonly repository: GatewaysRepository
    ) {}

    async getConfiguredGateways() {
        const gateways = await this.repository.loadConfiguredGateways();

        return {
            gateways
        };
    }

    async getAvailableGateways() {
        const gateways = await this.repository.loadAvailableGateways();

        return {
            gateways
        };
    }

    async addGateway(dto: GatewayConfigDTO) {
        const gateways = await this.getAvailableGateways();
        const gateway = gateways.gateways.find(g => g.gateway === dto.gateway);
        if (!gateway) {
            throw new Error('Gateway not found');
        }
        const entity = new GatewayConfigs();
        entity.gatewayId = gateway.id;
        entity.configs = JSON.stringify(dto.config);
        entity.isActive = dto.isActive;
        return await this.repository.save(entity, true);
    }
}