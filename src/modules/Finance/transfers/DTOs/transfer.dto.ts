import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class TransferDTO {
    @IsInt({ message: 'invalid id' })
    @IsOptional()
    id: number;

    @IsInt({ message: 'invalid clientId' })
    @IsOptional()
    clientId: number;

    @IsInt({ message: 'invalid originAccount' })
    @IsNotEmpty({ message: 'originAccount cannot be empty' })
    originAccount: number;

    @IsInt({ message: 'invalid targetAccount' })
    @IsNotEmpty({ message: 'targetAccount cannot be empty' })
    targetAccount: number;

    @IsNumber({}, { message: 'invalid amount' })
    @IsNotEmpty({ message: 'amount cannot be empty' })
    amount: number;

    @IsString({ message: 'invalid transferDate' })
    @IsNotEmpty({ message: 'transferDate cannot be empty' })
    transferDate: string;
}
