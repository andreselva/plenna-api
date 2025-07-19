import { InvoiceStatus } from "../Types/invoice.status.type";

export default class InvoiceRowDTO {
    id: number
    idBankAccount: number
    name: string
    closingDate: string;
    dueDate: string;
    paymentDate: string;
    status: InvoiceStatus;
}