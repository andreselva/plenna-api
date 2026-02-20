import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decoratos';
import { Role } from 'src/enum/role.enum';
import { SaasService } from './saas.service';
import { EditTenantModulesDTO } from './DTOs/edit-tenant-modules.dto';
import ClientDTO from '../management/clients/DTOs/client.dto';

@Controller('saas')
@Roles(Role.SUPER_ADMIN)
export class SaasController {
    constructor(
        private readonly service: SaasService
    ) {}

    @Get('/tenants')
    async getTenants() {
        return await this.service.getTenants();
    }

    @Get('/tenants/:id')
    async getTenant(@Param('id') id: string) {
        if (id !== undefined && id !== null && Number(id) > 0) {
            return await this.service.getTenant(Number(id));
        }
        throw new Error(`Invalid ID!`);
    }

    @Patch('/tenants/modules/edit/:id')
    async editTenantModules(@Param('id') clientId: string, @Body() modules: EditTenantModulesDTO) {
        return await this.service.saveClientModules(Number(clientId), modules);
    }

    @Patch('/tenants/edit')
    async editTenant(@Body() client: ClientDTO) {
        return await this.service.saveClient(client);
    }
}
