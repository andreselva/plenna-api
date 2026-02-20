import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import IUserModulesRow from "src/Shared/interfaces/IUserModulesRow";

export default class UserModules extends EntityModel implements IEntity {
    public id: number;
    public clientId: number;
    public userId: number;
    public moduleId: number;

    public static ignoredProperties: string[] = [];

    constructor() {
        super();
    }

    static fromDTO() {}

    static fromEntity(entity: UserModules) {
        const newUserModules = new UserModules(); 
        Object.assign(newUserModules, entity);
        return newUserModules;
    }

    /**
     * Método "fábrica" estático que cria uma instância de BankAccount
     * a partir de uma linha de dados crua vinda do banco de dados.
     * @param row O objeto de dados vindo da query.
     * @returns Uma nova instância de UserModules
     */
    static fromRow(row: IUserModulesRow) {
        const userModules = new UserModules();
        userModules.id = row.id;
        userModules.clientId = row.clientId;
        userModules.moduleId = row.moduleId;
        userModules.userId = row.userId;
        return userModules;
    }

    getTableName() {
        return 'user_modules'; 
    }

    getPrimaryKey() {
        return 'id';
    }

    getIgnoredProperties() {
        return UserModules.ignoredProperties;
    }

    addIgnoredProperty(property: string) {
        UserModules.ignoredProperties.push(property);
    }
}