import { Body, Controller, Get, Post } from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { GatewayConfigDTO } from './dtos/gateway.dto';

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

    @Post()
    async addGateway(@Body() dto: GatewayConfigDTO) {
        return await this.service.addGateway(dto);
    }
}