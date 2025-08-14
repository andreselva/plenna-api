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
        const client = new Client()
        client.clientEmail = user.email;
        client.clientName = user.name;
        return await this.repository.saveClient(client);
    }
}
