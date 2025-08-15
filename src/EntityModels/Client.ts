import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import IClientRow from "src/Shared/interfaces/IClientRow";
import User from "./User";

export default class Client extends EntityModel implements IEntity {
    public id: number;
    public clientEmail: string;
    public clientName: string;
    public document: string;
    public address: string;
    public number: string;
    public complement: string;
    public neighborhood: string;
    public city: string;
    public state: string;
    public zipCode: string;

    constructor() {
        super();
    }

    static fromUser(user: User) {
        const client = new Client();
        client.clientEmail = user.email;
        client.clientName = user.name;
        client.document = user.document;
        client.address = user.address;
        client.number = user.number;
        client.complement = user.complement;
        client.neighborhood = user.neighborhood;
        client.city = user.city;
        client.state = user.state;
        client.zipCode = user.zipCode;
        client.id = user.clientId ?? 0;
        return client;
    }

    static fromRow(row: IClientRow) {
        const client = new Client();
        client.id = row.id;
        client.clientEmail = row.clientEmail;
        client.clientName = row.clientName;
        client.document = row.document;
        client.address = row.address;
        client.number = row.number;
        client.complement = row.complement;
        client.neighborhood = row.neighborhood;
        client.city = row.city;
        client.state = row.state;
        client.zipCode = row.zipCode;
        return client;
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