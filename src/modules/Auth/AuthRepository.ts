import { Injectable } from "@nestjs/common";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import RefreshToken from "src/EntityModels/RefreshToken";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import { AuthContextService } from "./auth-context.service";

export interface RefreshTokenMetadata {
    ipAddress?: string | null;
    userAgent?: string | null;
}

export interface RefreshTokenRecord {
    idUser: number;
    refresh_token: string;
    ip_address?: string | null;
    user_agent?: string | null;
    created_at?: Date | string | null;
    last_used_at?: Date | string | null;
}

@Injectable()
export default class AuthRepository extends BaseRepository<RefreshToken>{
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext);
    }

    async saveRefreshToken(entity: RefreshToken, metadata: RefreshTokenMetadata = {}) {
        await this.deleteRefreshToken(entity.idUser);
        const query = `INSERT INTO refresh_token (idUser, refresh_token, ip_address, user_agent, created_at, last_used_at)
            VALUES (?, ?, ?, ?, NOW(), NOW())`;
        await this.database.execute(query, [
            entity.idUser,
            entity.refresh_token,
            metadata.ipAddress ?? null,
            metadata.userAgent ?? null,
        ]);

        return {
            isSuccess: true
        };
    }

    async findRefreshTokenByUserId(idUser: number): Promise<RefreshTokenRecord | null> {
        const query = `SELECT idUser, refresh_token, ip_address, user_agent, created_at, last_used_at
            FROM refresh_token WHERE idUser = ? LIMIT 1`;
        const result = await this.database.select(query, [idUser]);
        if (!result || result.length === 0) {
            return null;
        }

        return result[0] as RefreshTokenRecord;
    }

    async updateRefreshTokenMetadata(idUser: number, metadata: RefreshTokenMetadata = {}) {
        const query = `UPDATE refresh_token SET last_used_at = NOW(), ip_address = ?, user_agent = ? WHERE idUser = ?`;
        await this.database.execute(query, [
            metadata.ipAddress ?? null,
            metadata.userAgent ?? null,
            idUser,
        ]);
    }

    async deleteRefreshToken(idUser: number) {
        const query = "DELETE FROM refresh_token WHERE idUser = ?";
        await this.database.execute(query, [idUser]);
    }
}
