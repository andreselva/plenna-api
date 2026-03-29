import { Injectable } from '@nestjs/common';
import { GatewaysRepository } from './gateways.repository';

@Injectable()
export class GatewaysService {
    constructor(
        private readonly repository: GatewaysRepository
    ) {}

    async getGateways() {
        return await this.repository.loadAll();
    }
}
