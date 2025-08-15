export default class BankAccountResponseDTO {
    id: number;
    name: string;
    generateInvoice: boolean;
    icon?: string;
    dueDate?: string;
    closingDate?: string;

    constructor(id: number, name: string, generateInvoice: boolean, icon?: string, dueDate?: string, closingDate?: string) {
        this.id = Number(id);
        this.name = name;
        this.icon = icon;
        this.generateInvoice = generateInvoice;
        this.dueDate = dueDate;
        this.closingDate = closingDate;
    }
}