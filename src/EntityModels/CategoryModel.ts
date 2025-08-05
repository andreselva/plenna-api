export default class CategoryModel {
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
}