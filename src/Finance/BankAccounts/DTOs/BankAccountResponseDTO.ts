export default class BankAccountResponseDTO {
    id: number;
    name: string;
    icon?: string;

    constructor(id: number, name: string, icon?: string) {
        this.id = Number(id);
        this.name = name;
        this.icon = icon;
    }
}