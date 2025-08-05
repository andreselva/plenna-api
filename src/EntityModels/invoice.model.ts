import { InvoiceStatus } from "src/Finance/Invoices/Types/invoice.status.type";
import EntityModelInterface from "./entity.model.interface";

export default class InvoiceModel implements EntityModelInterface {
    id: number;
    idBankAccount: number;
    name: string;
    closingDate: string;
    dueDate: string;
    paymentDate: string;
    status: InvoiceStatus

    constructor() {
        this.id = 0;
        this.idBankAccount = 0;
        this.name = '';
        this.closingDate = '';
        this.dueDate = '';
        this.paymentDate = '';
        this.status = 'pending';
    }
    
    setTableName(): string {
        return 'invoices';
    }

    setPrimaryKey(): string {
        return 'id';
    }
}