import { IsBoolean, IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { RevenueStatus } from "../Types/revenue.status.type";

export class RevenueDTO {
    @IsString({ message: 'Invalid name!'})
    @IsNotEmpty({ message: 'Name is empty.' })
    name: string;

    @IsOptional()
    @IsString({ message: 'Invalid description!' })
    description: string;

    @IsNumber({}, { message: 'Invalid value!' })
    @IsNotEmpty({ message: 'Invalid value.' })
    @Min(0.01, { message: 'Invalid value!' })
    value: number;

    @IsDateString({}, { message: 'Invalid due date!' })
    @IsNotEmpty({ message: 'Invalid due date' })
    invoiceDueDate: string;

    @IsInt({ message: 'Invalid category ID!' })
    @IsNotEmpty({ message: 'Invalid category ID' })
    idCategory: number;

    @IsOptional()
    @IsInt({ message: 'Invalid installments!' })
    installments: number;

    @IsString({ message: 'Invalid type of installments! '})
    @IsNotEmpty({ message: 'Invalid type of installments.' })
    typeOfInstallments: string;

    @IsOptional()
    @IsInt({ message: 'Invalid source account ID! '})
    sourceAccountId: number;

    @IsBoolean({ message: 'Invalid argument hasInstallments!' })
    @IsNotEmpty({ message: 'Invalid argument hasInstallments' })
    hasInstallments: boolean;
    
    @IsString({ message: 'Invalid status!' })
    @IsNotEmpty({ message: 'Invalid status! Status cannot by empty.' })
    status: RevenueStatus;
    
    @IsOptional()
    @IsBoolean({ message: 'Invalid argument updateInstallments!' })
    updateInstallments: boolean;


    @IsOptional()
    @IsInt({ message: 'Invalid ID!' })
    id: number;
}