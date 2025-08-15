import { CategoryType } from "src/enum/category-type.enum";
import EntityModel from "./entity.model";
import IEntity from "src/Shared/interfaces/IEntity";
import CategoryDTO from "src/Categories/CategoryDTO";
import ICategoryRow from "src/Shared/interfaces/ICategoryRow";

export default class Category extends EntityModel implements IEntity {
    public id: number = 0;
    public clientId: number;
    public name: string = '';
    public description: string = '';
    public type: CategoryType = CategoryType.REVENUE;
    public color: string = '';

    constructor() {
        super();
    }

    static fromDTO(dto: CategoryDTO) {
        const category = new Category();
        category.name = dto.name;
        category.description = dto.description;
        category.type = dto.type ?? CategoryType.REVENUE;
        category.color = dto.color;
        category.id = dto.id ?? 0;
        return category;
    }

     /**
     * Método "fábrica" estático que cria uma instância de BankAccount
     * a partir de uma linha de dados crua vinda do banco de dados.
     * @param row O objeto de dados vindo da query.
     * @returns Uma nova instância de BankAccount.
     */
    static fromRow(row: ICategoryRow) {
        const category = new Category();

        category.id = row.id;
        category.name = row.name;
        category.color = row.color;
        category.type = row.type;
        category.description = row.description;
        category.clientId = row.clientId;

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