import { Injectable } from '@nestjs/common';
import { ClientsService } from 'src/management/clients/clients.service';
import User from 'src/EntityModels/User';
import { UsersService } from './Users/UserService';
import UserDTO from './Users/DTOs/UserDTO';

@Injectable()
export class ManagementService {
    constructor(
        private readonly userService: UsersService,
        private readonly clientService: ClientsService
    ) {}


    async registerUser(user: UserDTO) {
        const userEntity = User.fromDTO(user);
        const client = await this.clientService.createClient(userEntity)
        userEntity.clientId = client.id;
        const createdUser = await this.userService.createUser(userEntity)
        return { user: createdUser };
    }
}
