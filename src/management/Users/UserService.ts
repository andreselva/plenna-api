import { Injectable } from '@nestjs/common';
import UsersRepository from './UserRepository';
import PasswordHasher from 'src/Shared/Utils/Secutiry/PasswordHasher';
import User from 'src/EntityModels/User';

@Injectable()
export class UsersService {
    constructor(
        private readonly repository: UsersRepository,
    ) { }
    async findByUsername(username: string) {
        return await this.repository.findUserByUsername(username);
    }

    async createUser(user: User) {
        const senhaHash = await PasswordHasher.hash(user.password);
        user.password = senhaHash;
        return await this.repository.createUser(user);
    }

    async findUserById(id: string) {
        return await this.repository.findUserById(Number(id));
    }
}
