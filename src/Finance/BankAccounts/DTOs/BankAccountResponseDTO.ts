export default class BankAccountResponseDTO {
    id: number;
    name: string;
    icon?: string;
    generateInvoice: boolean;

    constructor(id: number, name: string, generateInvoice: boolean, icon?: string) {
        this.id = Number(id);
        this.name = name;
        this.icon = icon;
        this.generateInvoice = generateInvoice;
    }
}