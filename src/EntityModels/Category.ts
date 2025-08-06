import { CategoryType } from "src/enum/category-type.enum";
import EntityModel from "./entity.model";

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
}