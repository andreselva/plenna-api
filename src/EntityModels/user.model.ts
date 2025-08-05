import EntityModel from "./entity.model";

export default class UserModel extends EntityModel {
    id: number;
    username: string;
    password: string;
    email: string;
    name: string;

    constructor() {
        super();
        this.id = 0;
        this.username = '';
        this.password = '';
        this.email = '';
        this.name = '';
    }
    
    setTableName(): string {
        return 'user';
    }

    setPrimaryKey(): string {
        return 'id';
    }
}