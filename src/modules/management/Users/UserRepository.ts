import { Injectable, InternalServerErrorException } from "@nestjs/common";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import User from "src/EntityModels/User";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import { AuthContextService } from "src/modules/Auth/auth-context.service";

@Injectable()
export default class UsersRepository extends BaseRepository<User> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext)
    }
    async findUserByUsername(username: string) {
        const query = "SELECT * FROM user WHERE username = ?";
        const result = await this.database.select(query, [username]);
        return this.extractToEntity(result, User)[0] ?? null;
    }

    async saveUser(user: User) {
        if (!user.clientId) {
            user.clientId = this.authContext.getClientId();
        }
        
        const result = await this.save(user);
        if (result.insertId > 0 && user.id === 0) {
            user.id = result.insertId;
        }
        return user;
    }

    async findUserById(id: number, clientId: number|null = null) {
        if (clientId === null) {
            clientId = this.authContext.getClientId();

            if (!clientId) throw new InternalServerErrorException(`ClientId is not defined.`);
        }
        const query = "SELECT id, username, email, name, role, clientId FROM user WHERE id = ? AND clientId = ?";
        const result = await this.database.select(query, [id, clientId]);
        return this.extractToEntity(result, User)[0] ?? null;
    }

    async getUsers() {
        const query = "SELECT * FROM user WHERE clientId = ?";
        const result = await this.database.select(query, [this.authContext.getClientId()]);
        return this.extractToEntity(result, User);
    }

    async updatePassword(newPassword: string, userId: number) {
        const clientId = this.authContext.getClientId();
        const query = "UPDATE user SET password = ? WHERE id = ? AND clientId = ?";
        return await this.database.execute(query, [newPassword, userId, clientId]);
    }

    async getUserById(userId: number) {
        const clientId = this.authContext.getClientId();
        const query = "SELECT * FROM user WHERE id = ? AND clientId = ?";
        const result = await this.database.select(query, [userId, clientId]);
        return this.extractToEntity(result, User)[0] ?? null;
    }

    async deleteUser(userId: number) {
        const clientId = this.authContext.getClientId();
        const query = "DELETE FROM user WHERE id = ? AND clientId = ?";
        return await this.database.execute(query, [userId, clientId]);
    }

    async deleteRefreshToken(userId: number) {
        return await this.database.execute('DELETE FROM refresh_token WHERE idUser = ?', [userId]);
    }
}