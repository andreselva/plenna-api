export default class BankAccount {
    id?: number;
    name: string;
    generateInvoice: boolean;
    icon?: string;

    constructor(name: string, generateInvoice: boolean, icon: string = "", id?: number) {
        this.icon = icon;
        this.id = id;
        this.name = name;
        Boolean(this.generateInvoice = generateInvoice);
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
}