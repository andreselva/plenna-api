export default class BankAccount {
    id?: number;
    name: string;
    icon?: string;

    constructor(name: string, icon: string = "", id?: number) {
        this.icon = icon;
        this.id = id;
        this.name = name;
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
}