import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Role } from "src/enum/role.enum";

export default class UserDTO {
    @IsString({ message: 'Invalid username!' })
    @IsNotEmpty({ message: 'Invalid username.' })
    username: string;

    @IsString({ message: 'Invalid password!' })
    @IsNotEmpty({ message: 'Invalid password.' })
    password: string;

    @IsString({ message: 'Invalid email!' })
    @IsNotEmpty({ message: 'Invalid email.' })
    email: string;

    @IsString({ message: 'Invalid name!' })
    @IsNotEmpty({ message: 'Invalid name.' })
    name: string;

    @IsOptional()
    @IsInt({ message: 'Invalid ID!' })
    id: number;

    @IsOptional()
    @IsInt({ message: 'Invalid clientId'})
    clientId: number;

    @IsOptional()
    @IsString({ message: 'Invalid document!' })
    document: string;

    @IsOptional()
    @IsString({ message: 'Invalid address!' })
    address: string;

    @IsOptional()
    @IsString({ message: 'Invalid number!' })
    number: string;

    @IsOptional()
    @IsString({ message: 'Invalid complement!' })
    complement: string;

    @IsOptional()
    @IsString({ message: 'Invalid neighborhood!' })
    neighborhood: string;

    @IsOptional()
    @IsString({ message: 'Invalid city!' })
    city: string;

    @IsOptional()
    @IsString({ message: 'Invalid state!' })
    state: string;

    @IsOptional()
    @IsString({ message: 'Invalid zipcode!' })
    zipCode: string;

    @IsOptional()
    @IsEnum(Role, {message: 'Invalid role!'})
    role: string;
}