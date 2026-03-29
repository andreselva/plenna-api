import { Controller, Get } from '@nestjs/common';
import { GatewaysService } from './gateways.service';

@Controller('gateways')
export class GatewaysController {
    constructor(
        private readonly service: GatewaysService
    ) {}

    @Get()
    async getGateways() {
        return await this.service.getConfiguredGateways();
    }

    @Get('/available')
    async getAvailableGateways() {
        return await this.service.getAvailableGateways();
    }
}
