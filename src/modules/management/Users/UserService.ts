import { ConflictException, Injectable } from '@nestjs/common';
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
        const existUser = await this.findByUsername(user.username);
        if (existUser) throw new ConflictException(`Nome de usuário já existente. Escolha outro nome de usuário.`);
        const senhaHash = await PasswordHasher.hash(user.password);
        user.password = senhaHash;
        return await this.repository.createUser(user);
    }

    async findUserById(id: string) {
        return await this.repository.findUserById(Number(id));
    }
    
    async getUsers() {
        const users = await this.repository.getUsers();
        users.map((user) => {
            user.password = 'alan-turing'
        })
        return {users: users};
    }

}
