import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import IClientModulesRow from "src/Shared/interfaces/IClientModulesRow";

export default class ClientModules extends EntityModel implements IEntity {
    public id: number;
    public clientId: number;
    public userId: number;
    public moduleId: number;

    public static ignoredProperties: string[] = [];

    constructor() {
        super();
    }

    static fromDTO() {}

    static fromEntity(entity: ClientModules) {
        const newClientModules = new ClientModules(); 
        Object.assign(newClientModules, entity);
        return newClientModules;
    }

    /**
     * Método "fábrica" estático que cria uma instância de BankAccount
     * a partir de uma linha de dados crua vinda do banco de dados.
     * @param row O objeto de dados vindo da query.
     * @returns Uma nova instância de BankAccount.
     */
    static fromRow(row: IClientModulesRow) {
        const clientModule = new ClientModules();
        clientModule.id = row.id;
        clientModule.clientId = row.clientId;
        clientModule.userId = row.userId;
        clientModule.moduleId = row.moduleId;
        return clientModule;
    }

    getTableName() {
        return 'client_modules'; 
    }

    getPrimaryKey() {
        return 'id';
    }

    getIgnoredProperties() {
        return ClientModules.ignoredProperties;
    }

    addIgnoredProperty(property: string) {
        ClientModules.ignoredProperties.push(property);
    }
}