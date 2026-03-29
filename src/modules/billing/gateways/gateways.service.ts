import { Injectable } from '@nestjs/common';
import { GatewaysRepository } from './gateways.repository';

@Injectable()
export class GatewaysService {
    constructor(
        private readonly repository: GatewaysRepository
    ) {}

    async getConfiguredGateways() {
        const configuredGateways = await this.repository.loadConfiguredGateways();
        return configuredGateways;
    }

    async getAvailableGateways() {
        const options = await this.repository.loadAll();
        return options;
    }
}
