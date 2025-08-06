import { CategoryType } from "src/enum/category-type.enum";
import EntityModel from "./entity.model";

interface CategoryRow {
    id: number;
    name: string;
    description: string;
    type: CategoryType;
    color: string;
}

export default class Category extends EntityModel {
    public name: string;
    public description: string;
    public type: CategoryType;
    public color: string;
    public id?: number;

    constructor() {
        super();
        this.name = '';
        this.description = '';
        this.color = ''
        this.type = CategoryType.REVENUE;
        this.id = 0;
    }

    static fromRow(row: CategoryRow) {
        const category = new Category();

        category.id = row.id;
        category.name = row.name;
        category.color = row.color;
        category.type = row.type;
        category.description = row.description;

        return category;
    }
}