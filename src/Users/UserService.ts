import { Injectable } from '@nestjs/common';
import UsersRepository from './UserRepository';
import UserDTO from './DTOs/UserDTO';
import User from './Entity/User';
import * as bcrypt from 'bcryptjs';


@Injectable()
export class UsersService {
    constructor(
        private readonly repository: UsersRepository
    ) { }
    async findByUsername(username: string) {
        return await this.repository.findUserByUsername(username);
    }

    async createUser(user: UserDTO) {
        const senhaHash = await bcrypt.hash(user.password, 10);
        user.password = senhaHash;
        const entity = User.fromDTO(user);
        return await this.repository.createUser(entity);
    }

    async findUserById(id: string) {
        return await this.repository.findUserById(Number(id));
    }
}
