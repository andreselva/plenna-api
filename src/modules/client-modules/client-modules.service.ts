import { Injectable } from '@nestjs/common';
import ClientModulesRepository from './client-modules.repository';

@Injectable()
export class ClientModulesService {
    constructor(
        private readonly repository: ClientModulesRepository
    ) {}

    async getModules() {
        const modules = await this.repository.getModulesByUserId();
    }

    private organize() {

    }

}
