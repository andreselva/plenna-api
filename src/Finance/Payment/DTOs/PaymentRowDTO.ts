import { PaymentType } from "../Types/payment.type";

export default class PaymentRowDTO {
    public id: number;
    public payableType: PaymentType;
    public payableId: number
    public value: number;
    public paymentDate: string;
}