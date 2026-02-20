import { Injectable } from '@nestjs/common';
import SaasRepository from './saas.repository';
import Module from 'src/EntityModels/Module';
import { EditTenantModulesDTO } from './DTOs/edit-tenant-modules.dto';
import ClientModules from 'src/EntityModels/ClientModules';
import UserModules from 'src/EntityModels/UserModules';
import RedisService from '../redis/redis-service';
import { RedisKeys } from '../redis/redis.keys';
import ClientDTO from '../management/clients/DTOs/client.dto';
import Client from 'src/EntityModels/Client';

@Injectable()
export class SaasService {
    constructor(
        private readonly repository: SaasRepository,
        private readonly redisService: RedisService
    ) {}

    async getTenants() {
        return await this.repository.getTenants();    
    }

    async getTenant(id: number) {
        const tenant = await this.repository.getTenant(id);
        if (tenant === null || tenant === undefined) {
            throw new Error('Client not found!');
        }
        const modules = await this.repository.getTenantModules(id);
        const organized = this.organizeModules(modules);
        return {
            tenant: tenant,
            modules: organized
        }
    }

    private organizeModules(modules: Module[]): Module[] {
        const moduleMap = new Map<number, Module>();
        const rootModules: Module[] = [];

        modules.forEach(module => {
            module.submodules = [];
            moduleMap.set(module.id, module);
        });

        modules.forEach(module => {
            if (module.parentId && module.parentId > 0) {
                const parent = moduleMap.get(module.parentId);
                if (parent) {
                    parent.submodules.push(module);
                }
            } else {
                rootModules.push(module);
            }
        });

        return rootModules;
    }

    async saveClientModules(clientId: number, modules: EditTenantModulesDTO) {
        const usersAdmin = await this.repository.getUsersAdminFromClientId(clientId);
        if (Array.isArray(modules.disabled) && modules.disabled.length > 0) {
            await Promise.all(
                modules.disabled.map(async (m) => {
                    const ids = new Set<number>([m.moduleId]);
                    if (m.hasSubmodules) {
                        const sm = await this.repository.getSubmodules(m.moduleId);
                        sm.forEach((s) => ids.add(s.id));
                    }
                    await this.repository.disableModules(clientId, [...ids]);
                })
            );
        }

        if (Array.isArray(modules.enabled) && modules.enabled.length > 0) {
            await Promise.all(
                modules.enabled.map(async (m) => {
                    const moduleId = m.moduleId;
                    const arrayIdModule: number[] = [moduleId];
                    //Deleta antes de salvar, para não duplicar
                    await this.repository.disableModules(clientId, arrayIdModule);
                    const clientModule = new ClientModules();
                    clientModule.clientId = clientId;
                    clientModule.moduleId = moduleId;
                    await this.repository.saveClientModule(clientModule);
                    await Promise.all(
                        usersAdmin.map(async (user) => {
                            const userModules = new UserModules();
                            userModules.clientId = clientId;
                            userModules.userId = user.id;
                            userModules.moduleId = moduleId;
                            await this.repository.saveUserAdminModule(userModules);
                        })
                    )
                })
            );
        }

        await Promise.all(
            usersAdmin.map(async (user) => {
                const rk = RedisKeys.clientUserModuleTree(clientId, user.id);
                await this.redisService.delete(rk);
            })
        )
    }

    async saveClient(dto: ClientDTO) {
        const client = Client.fromDTO(dto);
        await this.repository.saveClient(client);
    }
}
