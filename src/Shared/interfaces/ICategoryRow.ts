import { CategoryType } from "src/enum/category-type.enum";

export default interface ICategoryRow {
    id: number;
    name: string;
    description: string;
    type: CategoryType;
    color: string;
    clientId: number
}