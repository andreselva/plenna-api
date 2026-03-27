import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateChargeDto {
    @IsNotEmpty({ message: 'expenseId cannot be empty' })
    @IsNumber({}, { message: 'expenseId must be a number' })
    expenseId: number;
}