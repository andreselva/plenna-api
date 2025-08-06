import EntityModel from "./entity.model";

export default class CategoryModel extends EntityModel {
    id?: number;
    name?: string;
    type?: string;
    description?: string;
    color?: string;

    constructor() {
        super();
        this.id = 0;
        this.name = '';
        this.type = '';
        this.description = ''
    }
}