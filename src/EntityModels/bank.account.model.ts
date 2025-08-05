import EntityModel from "./entity.model";

export default class BankAccountModel extends EntityModel {
    id: number;
    name: string;
    icon: string;
    closingDate: string;
    dueDate: string;
    generateInvoice: boolean;

    constructor() {
        super();
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