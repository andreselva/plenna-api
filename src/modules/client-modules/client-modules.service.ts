import { Inject, Injectable } from '@nestjs/common';
import ClientModulesRepository from './client-modules.repository';
import { AuthContextService } from '../Auth/auth-context.service';
import { Environment } from '../Config/Database/Environment';
import UiCatalogDTO from './DTOs/UiCatalogDto';
import Module from 'src/EntityModels/Module';
import { Role } from 'src/enum/role.enum';
import RedisService from '../redis/redis-service';
import { RedisKeys } from '../redis/redis.keys';

@Injectable()
export class ClientModulesService {
    constructor(
        private readonly repository: ClientModulesRepository,
        private authContext: AuthContextService,
        private readonly redisService: RedisService
    ) {}

    async getModules() {
        const redisKey = RedisKeys.clientUserModuleTree(this.authContext.getClientId(), this.authContext.getUserId());
        if (this.authContext.getRole() === Role.SUPER_ADMIN) {
            const modules = await this.repository.getModuleTreeForSuperAdmin();
            return {
                modules: this.organize(modules)
            }
        }

        if (process.env.NODE_ENV === Environment.PRODUCTION) {
            const cachedModules = await this.redisService.get(redisKey);
            if (cachedModules) {
                return {
                    modules: cachedModules
                };
            }
        }

        const modules = await this.repository.getModulesByUserId();
        const organized = this.organize(modules);
        if (process.env.NODE_ENV === Environment.PRODUCTION) {
            await this.redisService.set(redisKey, organized, 259200);// 3 dias
        }
        return {
            modules: organized
        }
    }

    private organize(modules: Module[]) {
        const uiCatalogDto = new UiCatalogDTO();

        uiCatalogDto.items = modules.map(m => ({
            key: m.id,
            name: m.name,
            route: m.location,
            description: m.description,
            showInSidebar: Boolean(m.showInSidebar),
        }));

        for (const m of modules) {
            if (!m.group) continue;
            const layoutKey = m.group;
            const groupTitle = m.subgroup ?? "Geral";     
            uiCatalogDto.layouts[layoutKey] ??= [];

            let group = uiCatalogDto.layouts[layoutKey].find(g => g.title === groupTitle);

            if (!group) {
                group = { title: groupTitle, items: [] };
                uiCatalogDto.layouts[layoutKey].push(group);
            }

            group.items.push({
                name: m.name, 
                route: m.location, 
                description: m.description, 
                showInSidebar: m.showInSidebar,
                key: m.id,
                displayName: m.displayName ?? ''
            });
        }

        for (const layoutName of Object.keys(uiCatalogDto.layouts)) {
            for (const group of uiCatalogDto.layouts[layoutName]) {
                group.items = Array.from(new Set(group.items)).sort();
            }
        }
        return uiCatalogDto;
    }
}
