import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import UserRowDTO from "./DTOs/UserRowDTO";
import User from "./Entity/User";
import { Injectable } from "@nestjs/common";

@Injectable()
export default class UsersRepository {

    constructor(
        private readonly database: MySQLDatabase
    ) { }

    async findUserByUsername(username: string) {
        const query = "SELECT * FROM user WHERE username = ?";
        const row = await this.database.select(query, [username]) as UserRowDTO[];

        if (row && row.length > 0 && row.length === 1) {
            const user = row[0];
            return new User(
                user.username,
                user.password,
                user.email,
                user.name,
                user.id
            )
        }
        return null;
    }

    async createUser(user: User) {
        const query = "INSERT INTO user (username, password, email, name) VALUES (?, ?, ?, ?)";
        const params = [
            user.getUserName(),
            user.getPassword(),
            user.getEmail(),
            user.getName()
        ];
        
        const result = await this.database.execute(query, params);

        if (result.affectedRows > 0) {
            return user;
        }
    }

    async findUserById(id: number) {
        const query = "SELECT id, username, email, name FROM user WHERE id = ?";
        const result = await this.database.select(query, [id]) as UserRowDTO[];

        if (result) {
            const user = result[0];
            return new User(
                user.username,
                user.password,
                user.email,
                user.name,
                user.id
            )
        }
    }
}