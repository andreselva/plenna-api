import EntityModel from "./entity.model";

export default class RefreshTokenModel extends EntityModel {
    id: number;
    refresh_token: string;
    idUser: number;
    
    constructor() {
        super();
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