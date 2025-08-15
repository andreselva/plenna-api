import { IsInt, IsNotEmpty, IsString } from "class-validator";
import { PaymentType } from "../Types/payment.type";

export default class ReversePaymentDataDTO {
    @IsInt({ message: 'Invalid payment ID!'})
    @IsNotEmpty({ message: 'Invalid payment ID.' })
    paymentId: number;

    @IsString({ message: 'Invalid payment type' })
    @IsNotEmpty({ message: 'Invalid payment type' })
    entityType: PaymentType;

    @IsInt({ message: 'Invalid ID!'})
    @IsNotEmpty({ message: 'Invalid ID.' })
    entityId: number;
}