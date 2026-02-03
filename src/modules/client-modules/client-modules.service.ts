import { Inject, Injectable } from '@nestjs/common';
import ClientModulesRepository from './client-modules.repository';
import Module from 'src/EntityModels/Module';
import { AuthContextService } from '../Auth/auth-context.service';
import { REDIS_CONNECTION } from '../redis/redis.module';
import Redis from 'ioredis';
import { Environment } from '../Config/Database/Environment';

@Injectable()
export class ClientModulesService {
    constructor(
        private readonly repository: ClientModulesRepository,
        private authContext: AuthContextService,
        @Inject(REDIS_CONNECTION) private readonly redis: Redis
    ) {}

    async getModules(sidebar: boolean = false) {
        const cachedModules = await this.getModulesTreeFromCache(sidebar);
        if (cachedModules) {
            return {
                modules: cachedModules
            };
        }

        let modules: Module[] = [];
        if (!sidebar) {
            modules = await this.repository.getModulesByUserId();
        } else {
            modules = await this.repository.getModulesByUserIdFromSidebar();
        }

        const organized = this.organize(modules);
        if (process.env.NODE_ENV !== Environment.DEVELOPMENT) {
            await this.saveModulesTree(organized, sidebar);
        }
        return {
            modules: organized
        }
    }

    private organize(modules: Module[]) {
        modules.forEach(module => {
            if (module.parentId > 0) {
                const parent = modules.find(m => m.id === module.parentId);
                if (parent) {
                    parent.childrenModules.push(module);
                }
            }
        });
        const rootModules = modules.filter(m => m.parentId === 0);
        return rootModules;
    }

    private async getModulesTreeFromCache(sidebar: boolean = false): Promise<Module[] | null> {
        if (process.env.NODE_ENV === Environment.DEVELOPMENT) {
            return null;
        } 
        const cacheKey = this.getCacheKey(sidebar);
        if (!cacheKey) {
            return null;
        }
        const cached = await this.redis.get(cacheKey);
        if (!cached) {
            return null;
        }
        try {
            return JSON.parse(cached) as Module[];
        } catch {
            return null;
        }
    }

    private async saveModulesTree(modulesTree: Module[], sidebar: boolean = false) {
        const cacheKey = this.getCacheKey(sidebar);
        if (!cacheKey) {
            return;
        }
        await this.redis.set(cacheKey, JSON.stringify(modulesTree));
    }
    
    async deleteModulesTreeFromCache(sidebar: boolean = false): Promise<void> {
        const cacheKey = this.getCacheKey();
        if (!cacheKey) {
            return;
        }
        await this.redis.del(cacheKey);
    }

    private getCacheKey(sidebar: boolean = false): string | null {
        const userId = this.authContext.getUserId();
        const clientId = this.authContext.getClientId();
        if (!userId || !clientId) {
            return null;
        }

        if (sidebar) {
            return `client_modules_tree_sidebar:${clientId}:${userId}`;
        }
        return `client_modules_tree:${clientId}:${userId}`;
    }
}
