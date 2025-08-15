import { Role } from "src/enum/role.enum";

export default interface IUserRow {
    id: number;
    username: string;
    password: string;
    email: string;
    name: string;
    clientId: number;
    role: Role;
}