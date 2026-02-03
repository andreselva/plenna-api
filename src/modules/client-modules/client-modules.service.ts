import { Injectable } from '@nestjs/common';
import ClientModulesRepository from './client-modules.repository';
import Module from 'src/EntityModels/Module';

@Injectable()
export class ClientModulesService {
    constructor(
        private readonly repository: ClientModulesRepository
    ) {}

    async getModules() {
        let modules = await this.repository.getModulesByUserId();
        return {
            modules: this.organize(modules)
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

}
