import { Controller, Get } from '@nestjs/common';
import { ClientModulesService } from './client-modules.service';

@Controller('client-modules')
export class ClientModulesController {
    constructor(
        private readonly service: ClientModulesService
    ) {}
    
    @Get()
    async getClientModules() {
        return await this.service.getModules();
    }
}
