import { PaymentType } from "../Types/payment.type";

export default class PaymentInicialDataDTO {
    public value: number;
    public paymentDate: string;
    public payableId: number;
    public payableType: PaymentType;
    public id?: number;
}