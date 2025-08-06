import { IsEnum, IsHexColor, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { CategoryType } from "src/enum/category-type.enum";

export default class CategoryDTO {
    @IsString({ message: 'O nome deve ser um texto.' })
    @IsNotEmpty({message: 'Nome não pode ser vazio.'})
    name: string;

    @IsOptional()
    @IsString({ message: 'Descrição deve ser um texto.' })
    description: string;

    @IsEnum(CategoryType, { message: 'O tipo deve ser "Receita" ou "Despesa".' })
    @IsNotEmpty({ message: 'Tipo não pode ser vazio.' })
    type: CategoryType;

    @IsHexColor({ message: 'A cor deve estar no formato hexadecimal (ex: #FF0000).' })
    @IsNotEmpty({ message: 'Cor não pode ser vazio.' })
    color: string;

    @IsOptional()
    @IsInt({ message: 'O ID da categoria deve ser um número inteiro.' })
    id?: number;
}