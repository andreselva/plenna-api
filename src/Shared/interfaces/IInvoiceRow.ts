import { InvoiceStatus } from "src/modules/Finance/Invoices/Types/invoice.status.type";

export default interface IInvoiceRow {
    id: number;
    idBankAccount: number;
    name: string;
    closingDate: string;
    dueDate: string;
    paymentDate: string;
    status: InvoiceStatus;
    clientId: number;
}