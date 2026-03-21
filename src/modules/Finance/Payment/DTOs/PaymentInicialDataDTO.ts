import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { PaymentType } from "../Types/payment.type";

export default class PaymentInicialDataDTO {
    @IsNumber({}, { message: 'Invalid value!' })
    @IsNotEmpty({ message: 'Invalid value.'})
    value: number;

    @IsDateString({}, { message: 'Invalid payment date!' })
    @IsNotEmpty({ message: 'Invalid payment date.' })
    paymentDate: string;

    @IsInt({ message: 'Invalid id payment type!' })
    @IsNotEmpty({ message: 'Invalid id payment type.'})
    payableId: number;

    @IsString({ message: 'Invalid payment type!' })
    @IsNotEmpty({ message: 'Invalid payment type.' })
    payableType: PaymentType;

    @IsOptional()
    @IsInt({ message: 'Invalid ID!' })
    id: number;

    @IsInt({ message: 'Invalid account ID!' })
    @IsNotEmpty({ message: 'accountId cannot be empty' })
    accountId: number;


    @IsOptional()
    @IsString({ message: 'Invalid reversed value.' })
    reversed: string;
}