import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import UsersRepository from './UserRepository';
import PasswordHasher from 'src/Shared/Utils/Secutiry/PasswordHasher';
import User from 'src/EntityModels/User';
import UserPasswordResetDTO from './DTOs/UserPasswordResetDTO';
import UserDTO from './DTOs/UserDTO';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';

@Injectable()
export class UsersService {
    constructor(
        private readonly repository: UsersRepository,
        private readonly authContext: AuthContextService
    ) { }
    
    async findByUsername(username: string) {
        return await this.repository.findUserByUsername(username);
    }

    async createUser(user: User) {
        const existUser = await this.findByUsername(user.username);
        if (existUser) throw new ConflictException(`Nome de usuário já existente. Escolha outro nome de usuário.`);
        const senhaHash = await PasswordHasher.hash(user.password);
        user.password = senhaHash;
        return await this.repository.saveUser(user);
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

    async deleteUser(userId: number) {
        await this.repository.deleteUser(userId);
        await this.repository.deleteRefreshToken(userId);
        return;
    }

    async updateUser(user: UserDTO) {
        const entity = User.fromDTO(user);
        const oldUserVersion = await this.repository.findUserById(entity.id, entity.clientId);
        if (entity.role !== oldUserVersion.role) {
            //revoga o refreshtoken para forçar login quando o access_token expirar
            await this.repository.deleteRefreshToken(user.id);
        }
        //Não atualizamos a senha pelo update de usuário. A redefinição de senha acontece por outro endpoint.
        entity.addIgnoredProperty('password');
        await this.repository.saveUser(entity);
        return await this.getUsers();
    }
}
