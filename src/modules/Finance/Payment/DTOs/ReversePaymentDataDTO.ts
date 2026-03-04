import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";
import { PaymentType } from "../Types/payment.type";

export default class ReversePaymentDataDTO {
    @IsInt({ message: 'Invalid account ID!'})
    @IsNotEmpty({ message: 'Invalid ID.' })
    accountId: number;

    @IsInt({ message: 'Invalid reference ID!'})
    @IsNotEmpty({ message: 'Invalid reference ID.' })
    referenceId: number;

    @IsInt({ message: 'Invalid entity ID!'})
    @IsNotEmpty({ message: 'Invalid entity ID.' })
    entityId: number;

    @IsString({ message: 'Invalid reference type' })
    @IsNotEmpty({ message: 'Invalid reference type' })
    referenceType: PaymentType;

    @IsNumber({}, { message: 'O valor deve ser um número válido.' })
    @IsNotEmpty({ message: 'O valor não pode estar vazio.' })
    @Min(0, { message: 'O valor deve ser um número positivo.' })
    amount: number;


}