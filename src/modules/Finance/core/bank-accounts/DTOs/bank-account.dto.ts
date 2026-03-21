import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { BankAccountTypeEnum } from "src/enum/bank-account-type.enum";

export class BankAccountDTO {
    @IsInt({ message: 'invalid id' })
    @IsOptional()
    id: number;

    @IsString({ message: 'invalid name' })
    @IsNotEmpty({ message: 'name cannot be empty' })
    name: string;

    @IsEnum(BankAccountTypeEnum, { message: 'type should by: CHECKING, SAVINGS, DIGITAL_WALLET or INVESTMENT' })
    @IsNotEmpty({ message: 'type cannot be empty' })
    type: BankAccountTypeEnum;

    @IsInt({ message: 'invalid bankCode' })
    @IsOptional()
    bankCode: number;

    @IsString({ message: 'invalid agency' })
    @IsOptional()
    agency: string;
    
    @IsString({ message: 'invalid accountNumber' })
    @IsOptional()
    accountNumber: string;
    
    @IsNumber({}, { message: 'invalid initialBalance' })
    @IsNotEmpty({ message: 'initialBalance cannot be empty' })
    initialBalance: number;

    @IsBoolean({ message: 'isActive invalid' })
    @IsNotEmpty({ message: 'isActive cannot be empty' })
    isActive: boolean;
}