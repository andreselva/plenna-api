import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import UsersRepository from './UserRepository';
import PasswordHasher from 'src/Shared/Utils/Secutiry/PasswordHasher';
import User from 'src/EntityModels/User';
import UserPasswordResetDTO from './DTOs/UserPasswordResetDTO';
import UserDTO from './DTOs/UserDTO';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import { Role } from 'src/enum/role.enum';

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
        return { users: users.map((user) => this.sanitizeUser(user)) };
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
        if (!user.id) {
            throw new NotFoundException('Usuário não informado.');
        }

        const requester = this.authContext.getUser();
        if (!requester) {
            throw new UnauthorizedException();
        }

        const entity = await this.repository.getUserById(user.id);
        if (!entity) {
            throw new NotFoundException('Usuário não encontrado.');
        }

        const isAdmin = requester.role === Role.ADMIN;
        if (!isAdmin && requester.id !== entity.id) {
            throw new ForbiddenException('Você não tem permissão para alterar este usuário.');
        }

        if (!isAdmin && user.role && user.role !== entity.role) {
            throw new ForbiddenException('Você não tem permissão para alterar a função.');
        }

        const roleWillChange = isAdmin && user.role && user.role !== entity.role;

        if (isAdmin) {
            entity.username = user.username ?? entity.username;
            entity.role = user.role ?? entity.role;
        }

        entity.email = user.email ?? entity.email;
        entity.name = user.name ?? entity.name;

        entity.addIgnoredProperty('password');

        await this.repository.saveUser(entity);

        if (roleWillChange) {
            await this.repository.deleteRefreshToken(entity.id);
        }

        if (isAdmin) {
            const users = await this.repository.getUsers();
            return { users: users.map((item) => this.sanitizeUser(item)) };
        }

        return { user: this.sanitizeUser(entity) };
    }

    private sanitizeUser(user: User) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role,
        };
    }
}
