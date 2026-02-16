import { Injectable } from '@nestjs/common';
import SaasRepository from './saas.repository';
import Module from 'src/EntityModels/Module';

@Injectable()
export class SaasService {
    constructor(
        private readonly repository: SaasRepository
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
}
