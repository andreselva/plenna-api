import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import IModuleRow from "src/Shared/interfaces/IModuleRow";

export default class Module extends EntityModel implements IEntity {
    public id: number;
    public parentId: number;
    public name: string;
    public location: string;
    public description: string;

    public static ignoredProperties: string[] = [];

    constructor() {
        super();
    }

    static fromDTO() {}

    static fromEntity(entity: Module) {
        const module = new Module(); 
        Object.assign(module, entity);
        return module;
    }

    /**
     * Método "fábrica" estático que cria uma instância de BankAccount
     * a partir de uma linha de dados crua vinda do banco de dados.
     * @param row O objeto de dados vindo da query.
     * @returns Uma nova instância de BankAccount.
     */
    static fromRow(row: IModuleRow) {
        const module = new Module();
        module.id = row.id;
        module.parentId = row.parentId;
        module.name = row.name;
        module.location = row.location;
        module.description = row.description;
        return module;
    }

    getTableName() {
        return 'client_modules'; 
    }

    getPrimaryKey() {
        return 'id';
    }

    getIgnoredProperties() {
        return Module.ignoredProperties;
    }

    addIgnoredProperty(property: string) {
        Module.ignoredProperties.push(property);
    }
}