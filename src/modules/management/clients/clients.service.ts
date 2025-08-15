import { Injectable } from '@nestjs/common';
import Client from 'src/EntityModels/Client';
import ClientRepository from './clients.repository';
import UserDTO from '../Users/DTOs/UserDTO';

@Injectable()
export class ClientsService {
    constructor(
        private readonly repository: ClientRepository
    ) {}
    
    async createClient(user: UserDTO) {
        const client = Client.fromUser(user);
        return await this.repository.saveClient(client);
    }
}
