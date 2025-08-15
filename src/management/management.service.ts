import { Injectable } from '@nestjs/common';
import { ClientsService } from 'src/management/clients/clients.service';
import User from 'src/EntityModels/User';
import { UsersService } from './Users/UserService';
import UserDTO from './Users/DTOs/UserDTO';
import { Role } from 'src/enum/role.enum';

@Injectable()
export class ManagementService {
    constructor(
        private readonly userService: UsersService,
        private readonly clientService: ClientsService
    ) {}

    async registerUser(user: UserDTO) {
        const userEntity = User.fromDTO(user);
        //Seta pra admin nessa rota, pois o cadastro vem da tela de login/cadastro
        userEntity.role = Role.ADMIN;
        const client = await this.clientService.createClient(user)
        userEntity.clientId = client.id;
        const createdUser = await this.userService.createUser(userEntity)
        return { user: createdUser };
    }
}
