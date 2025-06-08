export default class Invoice {
    private closingDate: string;
    private dueDate: string;
    private idBankAccount: number;
    private name: string;
    private id?: number;
    private status?: string;

    constructor(closingDate: string, dueDate: string, idBankAccount: number, name: string, id?: number) {
        this.closingDate = closingDate;
        this.dueDate = dueDate;
        this.idBankAccount = idBankAccount;
        this.name = name;
        this.id = id;
        this.status = 'pending'
    }

    getClosingDate() {
        return this.closingDate;
    }

    getDueDate() {
        return this.dueDate;
    }

    getIdBankAccount() {
        return this.idBankAccount;
    }

    getName() {
        return this.name;
    }

    getId() {
        return this.id;
    }

    getStatus() {
        return this.status;
    }
}