export default class UserResponseDTO {
    public readonly username: string;
    public readonly password: string;
    public readonly email: string;
    public readonly name: string;

    constructor(username: string, password: string, email: string, name: string) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.name = name;
    }
}