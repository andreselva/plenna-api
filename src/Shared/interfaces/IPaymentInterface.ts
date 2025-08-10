import { PaymentType } from "src/Finance/Payment/Types/payment.type";

export default interface IPaymentRow {
    id: number;
    value: number;
    payment_date: string;
    payable_id: number;
    payable_type: PaymentType;
}