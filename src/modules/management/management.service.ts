import { Injectable } from '@nestjs/common';
import User from 'src/EntityModels/User';
import { UsersService } from './Users/UserService';
import UserDTO from './Users/DTOs/UserDTO';
import { Role } from 'src/enum/role.enum';
import { ClientsService } from './clients/clients.service';
import { AuthContextService } from '../Auth/auth-context.service';

@Injectable()
export class ManagementService {
    constructor(
        private readonly userService: UsersService,
        private readonly clientService: ClientsService,
        private readonly authContext: AuthContextService
    ) {}

    async registerUser(user: UserDTO) {
        const userEntity = User.fromDTO(user);
        if (!user.role) {
            userEntity.role = Role.ADMIN;
        }

        if (this.authContext.getClientId() === undefined || this.authContext.getClientId() === 0) {
            const client = await this.clientService.createClient(user)
            userEntity.clientId = client.id;
        } else {
            userEntity.clientId = this.authContext.getClientId();
        }

        const createdUser = await this.userService.createUser(userEntity)
        return { user: createdUser };
    }
}
