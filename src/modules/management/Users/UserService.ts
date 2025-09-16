import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import UsersRepository from './UserRepository';
import PasswordHasher from 'src/Shared/Utils/Secutiry/PasswordHasher';
import User from 'src/EntityModels/User';
import UserPasswordResetDTO from './DTOs/UserPasswordResetDTO';

@Injectable()
export class UsersService {
    constructor(
        private readonly repository: UsersRepository,
    ) { }
    
    async findByUsername(username: string) {
        return await this.repository.findUserByUsername(username);
    }

    async createUser(user: User) {
        const existUser = await this.findByUsername(user.username);
        if (existUser) throw new ConflictException(`Nome de usuário já existente. Escolha outro nome de usuário.`);
        const senhaHash = await PasswordHasher.hash(user.password);
        user.password = senhaHash;
        return await this.repository.createUser(user);
    }

    async findUserById(id: string, clientId: string) {
        return await this.repository.findUserById(Number(id), Number(clientId));
    }
    
    async getUsers() {
        const users = await this.repository.getUsers();
        users.map((user) => {
            user.password = 'alan-turing'
        })
        return {users: users};
    }

    async resetPassword(userId: number, dto: UserPasswordResetDTO) {
        if (userId > 0) {
            const entity = await this.repository.getUserById(userId);
            if (entity) {
                const verifiedPassword = await PasswordHasher.compare(dto.oldPassword, entity.password);
                if (!verifiedPassword) throw new ForbiddenException(`Senha atual incorreta.`);
                const newPasswordHash = await PasswordHasher.hash(dto.password);
                return await this.repository.updatePassword(newPasswordHash, userId);
            }
            throw new NotFoundException(`Usuário não encontrado.`);
        }
    }

}
