export default class PaymentRowDTO {
    public id: number;
    public idInvoice: number;
    public idExpense: number | null;
    public value: number;
    public paymentDate: string;
}