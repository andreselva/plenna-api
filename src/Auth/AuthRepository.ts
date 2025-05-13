import { Injectable } from "@nestjs/common";
import MySQLDatabase from "src/Config/Database/MySQLDatabase";

@Injectable()
export default class AuthRepository {
    constructor(
        private readonly database: MySQLDatabase
    ) { }

    async saveRefreshToken(idUser: number, refreshToken: string) {
        //Apagar o antigo antes de salvar um novo.
        await this.deleteRefreshToken(idUser);
        const query = "INSERT refresh_token (refresh_token, idUser) VALUES (?, ?)";
        const result = await this.database.execute(query, [refreshToken, idUser]);

        if (result.affectedRows > 0) {
            return {
                isSuccess: true
            };
        }

        return {
            isSuccess: false
        };
    }

    async isRefreshTokenValid(refreshToken: string, idUser: number) {
        const query = "SELECT 1 FROM refresh_token WHERE refresh_token = ? AND idUser = ? LIMIT 1";
        const result = await this.database.select(query, [refreshToken, idUser]);
        if (result && result.length === 1) {
            return true;
        }
        return false;
    }

    async updateRefreshToken(refreshToken: string, idUser: number) {
        const query = "UPDATE refresh_token SET refresh_token = ? WHERE idUser = ?";
        await this.database.execute(query, [refreshToken, idUser]);
    }

    async deleteRefreshToken(idUser: number) {
        const query = "DELETE FROM refresh_token WHERE idUser = ?";
        await this.database.execute(query, [idUser]);
    }

    async deleteRefreshTokenByRefreshToken(refreshToken: string) {
        return await this.database.execute(`DELETE FROM refresh_token WHERE refresh_token = ?`, [refreshToken]);
    }

}