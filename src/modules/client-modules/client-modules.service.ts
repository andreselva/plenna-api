import { Inject, Injectable, Logger } from '@nestjs/common';
import ClientModulesRepository from './client-modules.repository';
import { AuthContextService } from '../Auth/auth-context.service';
import { REDIS_CONNECTION } from '../redis/redis.module';
import Redis from 'ioredis';
import { Environment } from '../Config/Database/Environment';
import UiCatalogDTO from './DTOs/UiCatalogDto';
import Module from 'src/EntityModels/Module';

@Injectable()
export class ClientModulesService {
    constructor(
        private readonly repository: ClientModulesRepository,
        private authContext: AuthContextService,
        @Inject(REDIS_CONNECTION) private readonly redis: Redis,
        private readonly logger = new Logger(ClientModulesService.name)
    ) {}

    async getModules() {
        this.logger.log("Getting modules.");
        const cachedModules = await this.getModulesTreeFromCache();
        this.logger.log(`Return cachedModules: ${cachedModules}`);
        if (cachedModules) {
            return {
                modules: cachedModules
            };
        }
        const modules = await this.repository.getModulesByUserId();
        const organized = this.organize(modules);
        this.logger.log(`Variável de ambiente: ${process.env.NODE_ENV}`);
        if (process.env.NODE_ENV !== Environment.DEVELOPMENT) {
            await this.saveModulesTree(organized);
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

    private async getModulesTreeFromCache(): Promise<Module[] | null> {
        if (process.env.NODE_ENV === Environment.DEVELOPMENT) {
            return null;
        } 
        const cacheKey = this.getCacheKey();
        this.logger.log(`cacheKey: ${cacheKey}`);
        if (!cacheKey) {
            return null;
        }
        const cached = await this.redis.get(cacheKey);
        this.logger.log(`Cached modules: ${cached}`);
        if (!cached) {
            return null;
        }
        try {
            return JSON.parse(cached) as Module[];
        } catch {
            return null;
        }
    }

    private async saveModulesTree(modulesTree: any) {
        const cacheKey = this.getCacheKey();
        if (!cacheKey) {
            return;
        }
        await this.redis.set(cacheKey, JSON.stringify(modulesTree));
    }
    
    async deleteModulesTreeFromCache(): Promise<void> {
        const cacheKey = this.getCacheKey();
        if (!cacheKey) {
            return;
        }
        await this.redis.del(cacheKey);
    }

    private getCacheKey(): string | null {
        const userId = this.authContext.getUserId();
        const clientId = this.authContext.getClientId();
        if (!userId || !clientId) {
            return null;
        }
        return `client_modules_tree:${clientId}:${userId}`;
    }
}
