import { IsEnum, IsHexColor, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { CategoryKind } from "src/enum/category-kind.enum";
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

    @IsInt({ message: 'Invalid parent ID' })
    @IsNotEmpty({ message: 'Empty parent ID.' })
    parentId: number;

    @IsEnum(CategoryKind, { message: 'Invalid kind.' })
    @IsNotEmpty({ message: 'Invalid kind.' })
    kind: CategoryKind;

    @IsOptional()
    @IsInt({ message: 'O ID da categoria deve ser um número inteiro.' })
    id: number;
}