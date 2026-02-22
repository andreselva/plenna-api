import { IsString } from "class-validator";

export default class RequestResetPasswordDTO {
    @IsString({message: 'Email inválido. Deve ser uma string.'})
    email: string;
}