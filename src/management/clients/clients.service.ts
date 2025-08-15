import { Injectable } from '@nestjs/common';
import Client from 'src/EntityModels/Client';
import User from 'src/EntityModels/User';
import ClientRepository from './clients.repository';

@Injectable()
export class ClientsService {
    constructor(
        private readonly repository: ClientRepository
    ) {}
    
    async createClient(user: User) {
        const client = Client.fromUser(user);
        return await this.repository.saveClient(client);
    }
}
