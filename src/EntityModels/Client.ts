import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import IClientRow from "src/Shared/interfaces/IClientRow";

export default class Client extends EntityModel implements IEntity {
    public id: number;
    public clientEmail: string;
    public clientName: string;

    constructor() {
        super();
    }

    fromRow(row: IClientRow) {
        const client = new Client();
        client.id = row.id;
        client.clientEmail = row.clientEmail;
        client.clientName = row.clientName;
    }

    getTableName(): string {
        return 'clients';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return [];
    }
}