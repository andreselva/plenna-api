import { IsString } from "class-validator";

export default class ResetPasswordDTO {
    @IsString({})
    token: string;

    @IsString({})
    newPassword: string
}