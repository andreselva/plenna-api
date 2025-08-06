import { CategoryType } from "src/enum/category-type.enum";
import EntityModel from "./entity.model";
import IEntity from "src/Shared/interfaces/IEntity";

interface CategoryRow {
    id: number;
    name: string;
    description: string;
    type: CategoryType;
    color: string;
}

export default class Category extends EntityModel implements IEntity {
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

     /**
     * Método "fábrica" estático que cria uma instância de BankAccount
     * a partir de uma linha de dados crua vinda do banco de dados.
     * @param row O objeto de dados vindo da query.
     * @returns Uma nova instância de BankAccount.
     */
    static fromRow(row: CategoryRow) {
        const category = new Category();

        category.id = row.id;
        category.name = row.name;
        category.color = row.color;
        category.type = row.type;
        category.description = row.description;

        return category;
    }

    getTableName(): string {
        return 'category';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return [];
    }
}