import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('client-modules')
export class ClientModulesController {
    
    @Get()
    @Public()
    getClientModules() {
        try {
            const modules = [];
            return modules;
        } catch (err) {

        }
    }
}
