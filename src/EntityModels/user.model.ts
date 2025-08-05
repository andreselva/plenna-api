import EntityModelInterface from "./entity.model.interface";

export default class UserModel implements EntityModelInterface {
    id: number;
    username: string;
    password: string;
    email: string;
    name: string;

    constructor() {
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