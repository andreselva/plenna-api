import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";

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