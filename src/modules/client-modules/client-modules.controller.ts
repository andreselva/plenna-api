import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
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

    @Get('/navigation')
    async getClientModulesNavigation() {
        return await this.service.getModules(true);
    }
}
