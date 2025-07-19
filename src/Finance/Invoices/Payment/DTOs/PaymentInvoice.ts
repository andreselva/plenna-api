export default class PaymentInvoice {
    public closingDate: string;
    public dueDate: string;
    public id: number;
    public idBankAccount: number;
    public name: string;
    public paymentDate: string | null;
    public status: string;
    public value: number;
    public expenses: object[];
}