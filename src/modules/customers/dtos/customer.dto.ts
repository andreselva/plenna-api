import { IsNotEmpty, IsString, IsEmail, Length } from "class-validator";

export class CustomerDTO {
    @IsString({ message: 'name must be string' })
    @IsNotEmpty({ message: 'name cannot be empty' })
    name: string;

    @IsEmail({}, { message: 'email must be a valid email' })
    @IsNotEmpty({ message: 'email cannot be empty' })
    email: string;

    @IsString({ message: 'document must be string' })
    @IsNotEmpty({ message: 'document cannot be empty' })
    document: string;

    @IsString({ message: 'cep must be string' })
    @IsNotEmpty({ message: 'cep cannot be empty' })
    @Length(8, 9, { message: 'cep must have 8 or 9 characters' })
    cep: string;

    @IsString({ message: 'neighborhood must be string' })
    @IsNotEmpty({ message: 'neighborhood cannot be empty' })
    neighborhood: string;

    @IsString({ message: 'city must be string' })
    @IsNotEmpty({ message: 'city cannot be empty' })
    city: string;

    @IsString({ message: 'state must be string' })
    @IsNotEmpty({ message: 'state cannot be empty' })
    @Length(2, 2, { message: 'state must have 2 characters (UF)' })
    state: string;

    @IsString({ message: 'country must be string' })
    @IsNotEmpty({ message: 'country cannot be empty' })
    country: string;

    @IsString({ message: 'street must be string' })
    @IsNotEmpty({ message: 'street cannot be empty' })
    street: string;

    @IsString({ message: 'number must be string' })
    @IsNotEmpty({ message: 'number cannot be empty' })
    number: string;

    @IsString({ message: 'phone must be string' })
    @IsNotEmpty({ message: 'phone cannot be empty' })
    phone: string;
}