import { IsNotEmpty, IsString } from "class-validator";

export default class UserPasswordResetDTO {
    @IsString({ message: 'Invalid current password' })
    @IsNotEmpty({ message: 'Invalid current password' })
    oldPassword: string;

    @IsString({ message: 'Invalid password' })
    @IsNotEmpty({ message: 'Invalid password' })
    password: string;
}