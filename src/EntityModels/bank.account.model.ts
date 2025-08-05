import EntityModelInterface from "./entity.model.interface";

export default class BankAccountModel implements EntityModelInterface {
    id: number;
    name: string;
    icon: string;
    closingDate: string;
    dueDate: string;
    generateInvoice: boolean;

    constructor() {
        this.id = 0;
        this.name = '';
        this.icon = '';
        this.closingDate = '';
        this.dueDate = '';
        this.generateInvoice = false;
    }

    setTableName(): string {
        return 'bank_account';
    }

    setPrimaryKey(): string {
        return 'id';
    }
}