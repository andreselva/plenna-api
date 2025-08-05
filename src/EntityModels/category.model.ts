import EntityModelInterface from "./entity.model.interface";

export default class CategoryModel implements EntityModelInterface {
    id?: number;
    name?: string;
    type?: string;
    description?: string;
    color?: string;

    constructor() {
        this.id = 0;
        this.name = '';
        this.type = '';
        this.description = ''
    }

    setTableName(): string {
        return 'category';
    }

    setPrimaryKey(): string {
        return 'id';
    }
}