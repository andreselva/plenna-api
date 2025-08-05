import EntityModelInterface from "./entity.model.interface";

export default class RefreshTokenModel implements EntityModelInterface {
    id: number;
    refresh_token: string;
    idUser: number;
    
    constructor() {
        this.id = 0;
        this.refresh_token = '';
        this.idUser = 0;
    }

    setTableName(): string {
        return 'refresh_token';
    }

    setPrimaryKey(): string {
        return 'id';
    }
}