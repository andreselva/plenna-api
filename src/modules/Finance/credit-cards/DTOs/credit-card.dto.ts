import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export default class CreditCardDTO {
    @IsString({ message: 'Name precisa ser uma string.' })
    @IsNotEmpty({ message: 'Name não pode ser vazio.' })
    name: string;

    @IsBoolean({ message: 'GenerateInvoice precisa ser um boolean.' })
    @IsNotEmpty({ message: 'Invalid argument.' })
    generateInvoice: boolean;

    @IsOptional()
    @IsString({ message: 'DueDate precisa ser uma string' })
    dueDate: string;

    @IsOptional()
    @IsString({ message: 'ClosingDate precisa ser uma string' })
    closingDate: string;

    @IsOptional()
    @IsInt({ message: 'Invalid ID!' })
    id: number;
}