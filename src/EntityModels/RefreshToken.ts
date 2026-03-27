import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import { IRefreshTokenRow } from "src/Shared/interfaces/IRefreshTokenRow";

export default class RefreshToken extends EntityModel implements IEntity {
    refresh_token: string;
    idUser: number;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt?: Date | string | null;
    lastUsedAt?: Date | string | null;

    constructor() {
        super();
    }

    static fromDTO() {

    }

    static fromRow(row: IRefreshTokenRow): RefreshToken {
        const rt = new RefreshToken();
        rt.refresh_token = row.refresh_token;
        rt.idUser = row.idUser;
        rt.ipAddress = row.ipAddress;
        rt.userAgent = row.userAgent;
        rt.createdAt = row.createdAt;
        rt.lastUsedAt = row.lastUsedAt;
        return rt;
    }

    getTableName(): string {
        return 'refresh_token';
    }

    getPrimaryKey(): string {
        return '';
    }

    getIgnoredProperties(): string[] {
        return [];
    }
}