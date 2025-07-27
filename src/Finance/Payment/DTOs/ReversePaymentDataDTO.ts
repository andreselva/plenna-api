import { PaymentType } from "../Types/payment.type";

export default class ReversePaymentDataDTO {
    paymentId: number;
    entityType: PaymentType;
    entityId: number;
}