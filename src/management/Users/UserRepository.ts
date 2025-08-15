import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import { Injectable } from "@nestjs/common";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import User from "src/EntityModels/User";

@Injectable()
export default class UsersRepository extends BaseRepository<User> {

    constructor(database: MySQLDatabase) { 
        super(database);
    }

    async findUserByUsername(username: string) {
        const query = "SELECT * FROM user WHERE username = ?";
        const result = await this.database.select(query, [username]);
        return this.extractToEntity(result, User)[0] ?? null;
    }

    async createUser(user: User) {
        const result = await this.save(user);
        if (result.insertId > 0 && user.id === 0) {
            user.id = result.insertId;
        }
        return user;
    }

    async findUserById(id: number) {
        const query = "SELECT id, username, email, name FROM user WHERE id = ?";
        const result = await this.database.select(query, [id]);
        return this.extractToEntity(result, User)[0] ?? null;
    }
}