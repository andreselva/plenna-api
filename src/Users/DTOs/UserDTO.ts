import { IsNotEmpty, IsString } from "class-validator";

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
}