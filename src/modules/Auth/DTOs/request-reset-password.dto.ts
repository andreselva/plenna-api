import { IsString } from "class-validator";

export default class RequestResetPasswordDTO {
    @IsString({message: 'Email inválido. Deve ser uma string.'})
    email: string;
    @IsString({message: 'username inválido. Deve ser uma string.'})
    username: string;
}