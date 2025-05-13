import UserDTO from "../DTOs/UserDTO";

export default class User {
    private readonly username: string;
    private readonly password: string;
    private readonly email: string;
    private readonly name: string;
    private readonly id?: number;

    constructor(username: string, password: string, email: string, name: string, id?: number) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.name = name;
        this.id = id;
    }

    getUserName() {
        return this.username;
    }

    getPassword() {
        return this.password;
    }

    getEmail() {
        return this.email;
    }

    getName() {
        return this.name;
    }

    getId() {
        return this.id;
    }

    static fromDTO(dto: UserDTO) {
        return new User(
            dto.username,
            dto.password,
            dto.email,
            dto.name
        )
    }
}