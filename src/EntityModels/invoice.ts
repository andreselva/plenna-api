import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import { Expense } from "./Expense";
import IInvoiceRow from "src/Shared/interfaces/IInvoiceRow";
import DateHelper from "src/Shared/Utils/DateHelper";
import { InvoiceStatus } from "src/modules/Finance/Invoices/Types/invoice.status.type";

export default class Invoice extends EntityModel implements IEntity {
    public id: number = 0;
    public clientId: number;
    public closingDate: string = '';
    public dueDate: string = '';
    public idBankAccount: number = 0;
    public name: string = '';
    public status: InvoiceStatus = 'pending';
    public paymentDate: string | null = '';
    public expenses: Expense[] = [];
    public value: number = 0;
    public totalPaid: number = 0;

    public static readonly STATUS_PAID: InvoiceStatus = 'paid';
    public static readonly STATUS_PENDING: InvoiceStatus = 'pending';
    public static readonly STATUS_PARCIAL: InvoiceStatus = 'partial';
    public static readonly STATUS_REVERSED: InvoiceStatus = 'reversed';

    constructor() {
        super();
    }

    static fromRow(row: IInvoiceRow) {
        const invoice = new Invoice();
        invoice.id = row.id;
        invoice.idBankAccount = row.idBankAccount;
        invoice.name = row.name;
        invoice.closingDate = DateHelper.toISODate(row.closingDate) as string;
        invoice.dueDate = DateHelper.toISODate(row.dueDate) as string;
        invoice.paymentDate = DateHelper.toISODate(row.paymentDate) ?? '';
        invoice.status = row.status;
        invoice.clientId = row.clientId;
        return invoice;
    }

    getTableName(): string {
        return 'invoices';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return ['expenses', 'value', 'totalPaid'];
    }
}