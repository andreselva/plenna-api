import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export default class BankAccountDTO {
    @IsString({ message: 'Name precisa ser uma string.' })
    @IsNotEmpty({ message: 'Name não pode ser vazio.' })
    name: string;

    @IsBoolean({ message: 'GenerateInvoice precisa ser um boolean.' })
    generateInvoice: boolean;

    @IsOptional()
    @IsString({ message: 'DueDate precisa ser uma string' })
    dueDate: string;

    @IsOptional()
    @IsString({ message: 'ClosingDate precisa ser uma string' })
    closingDate: string;

    @IsOptional()
    icon: string;

    @IsOptional()
    @IsInt({ message: 'ID precisa ser um inteiro.' })
    id: number;
}