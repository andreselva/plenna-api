export default class BankAccount {
    id?: number;
    name: string;
    generateInvoice: boolean;
    icon?: string;
    dueDate?: string;
    closingDate?: string;

    constructor(name: string, generateInvoice: boolean, icon: string = "", dueDate?: string, closingDate?: string, id?: number) {
        this.id = id;
        this.icon = icon;
        this.name = name;
        Boolean(this.generateInvoice = generateInvoice);
        this.dueDate = dueDate;
        this.closingDate = closingDate;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getIcon() {
        return this.icon;
    }

    getGenerateInvoice() {
        return this.generateInvoice;
    }

    getDueDate() {
        return this.dueDate;
    }

    getClosingDate() {
        return this.closingDate;
    }
}