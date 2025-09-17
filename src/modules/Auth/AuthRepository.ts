import { Injectable } from "@nestjs/common";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import RefreshToken from "src/EntityModels/RefreshToken";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import { AuthContextService } from "./auth-context.service";

@Injectable()
export default class AuthRepository extends BaseRepository<RefreshToken>{
    constructor(database: MySQLDatabase, authContext: AuthContextService) { 
        super(database, authContext);
    }

    async saveRefreshToken(entity: RefreshToken) {
        //Apagar o antigo antes de salvar um novo.
        await this.deleteRefreshToken(entity.idUser);
        await this.save(entity);

        return {
            isSuccess: true
        };
    }

    async isRefreshTokenValid(refreshToken: string, idUser: number) {
        const query = "SELECT 1 FROM refresh_token WHERE refresh_token = ? AND idUser = ? LIMIT 1";
        const result = await this.database.select(query, [refreshToken, idUser]);
        return result && result.length === 1;
    }

    async deleteRefreshToken(idUser: number) {
        const query = "DELETE FROM refresh_token WHERE idUser = ?";
        await this.database.execute(query, [idUser]);
    }

    async deleteRefreshTokenByRefreshToken(refreshToken: string) {
        return await this.database.execute(`DELETE FROM refresh_token WHERE refresh_token = ?`, [refreshToken]);
    }

}