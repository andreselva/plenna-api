import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { ClientModulesService } from './client-modules.service';

@Controller('client-modules')
export class ClientModulesController {
    constructor(
        private readonly service: ClientModulesService
    ) {}
    
    @Get()
    @Public()
    async getClientModules() {
        try {
            const modules = await this.service.getModules();
            return modules;
        } catch (err) {

        }
    }
}
