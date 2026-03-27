import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import { ICustomerRow } from "src/Shared/interfaces/ICustomerRow";
import { CustomerDTO } from "src/modules/customers/dtos/customer.dto";

export class Customer extends EntityModel implements IEntity {
    public id: number;
    public clientId: number;
    public name: string;
    public email: string;
    public document: string;
    public cep: string;
    public neighborhood: string;
    public city: string;
    public state: string;
    public country: string;

    public static fromRow(row: ICustomerRow): Customer {
        const customer = new Customer();
        customer.id = row.id;
        customer.clientId = row.clientId;
        customer.name = row.name;
        customer.email = row.email;
        customer.document = row.document;
        customer.cep = row.cep;
        customer.neighborhood = row.neighborhood;
        customer.city = row.city;
        customer.state = row.state;
        customer.country = row.country;
        return customer;
    }

    public static fromDTO(dto: CustomerDTO) {
        const customer = new Customer();
        customer.name = dto.name;
        customer.email = dto.email;
        customer.document = dto.document;
        customer.cep = dto.cep;
        customer.neighborhood = dto.neighborhood;
        customer.city = dto.city;
        customer.state = dto.state;
        customer.country = dto.country;
        return customer;
    }

    getTableName(): string {
        return 'customer';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return [];
    }
}