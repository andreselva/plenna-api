import EntityModel from "src/EntityModels/entity.model";
import { Role } from "src/enum/role.enum";
import UserDTO from "src/management/Users/DTOs/UserDTO";
import IEntity from "src/Shared/interfaces/IEntity";
import IUserRow from "src/Shared/interfaces/IUserRow";

export default class User extends EntityModel implements IEntity {
    public id: number;
    public username: string;
    public password: string;
    public email: string;
    public name: string;
    public document: string;
    public address: string;
    public number: string;
    public complement: string;
    public neighborhood: string;
    public city: string;
    public state: string;
    public zipCode: string;
    public clientId: number;
    public role: Role = Role.NORMAL_USER;

    constructor() {
        super();
    }

    static fromDTO(dto: UserDTO) {
        const user = new User();
        user.username = dto.username;
        user.password = dto.password;
        user.email = dto.email;
        user.name = dto.name;
        user.id = dto.id ?? 0
        user.document = dto.document ?? '';
        user.address = dto.address ?? '';
        user.number = dto.number ?? '';
        user.complement = dto.complement ?? '';
        user.neighborhood = dto.neighborhood ?? '';
        user.city = dto.city ?? '';
        user.state = dto.state ?? '';
        user.zipCode = dto.zipCode ?? '';
        return user;
    }

    static fromRow(row: IUserRow) {
        const user = new User();
        user.username = row.username;
        user.password = row.password;
        user.email = row.email;
        user.name = row.name;
        user.id = row.id;
        user.clientId = row.clientId;
        user.role = row.role;
        return user;
    }

    getTableName(): string {
        return 'user';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return ['document', 'address', 'number', 'complement', 'neighborhood', 'city', 'state', 'zipCode'];
    }
}