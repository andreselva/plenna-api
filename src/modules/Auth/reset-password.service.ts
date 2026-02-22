import { Injectable } from "@nestjs/common";
import RequestResetPasswordDTO from "./DTOs/request-reset-password.dto";
import AuthRepository from "./AuthRepository";
import TokenHasher from "src/Shared/Utils/Secutiry/TokenHasher";
import RedisService from "../redis/redis-service";
import { RedisKeys } from "../redis/redis.keys";
import { EmailService } from "../email/email.service";
import ResetPasswordDTO from "./DTOs/reset-password.dto";
import PasswordHasher from "src/Shared/Utils/Secutiry/PasswordHasher";

export interface ResetPasswordSummary {
    name: string;
    expireMinutes: number;
    resetLink: string;
    year: number;
}

@Injectable()
export default class ResetPasswordService {
    constructor(
        private readonly repository: AuthRepository,
        private readonly redisService: RedisService,
        private readonly emailService: EmailService
    ) {}

    async process(dto: RequestResetPasswordDTO) {
        const result = await this.repository.getUserByEmail(dto);
        if (result) {
            const { rawToken, tokenHash } = TokenHasher.getTokenByPasswordReset();
            const rk = RedisKeys.passwordResetToken(tokenHash);
            await this.redisService.set(rk, result.id, 300);//5 minutos
            
            const summary = {
                name: result.name,
                expireMinutes: 5,
                resetLink: `${process.env.FRONT_URL}reset-password?token=${rawToken}`,
                year: 2026
            } satisfies ResetPasswordSummary

            const to = result.email;
            const subject = "Redefinição de senha";
            await this.emailService.enqueueTemplate({
                to,
                subject,
                template: 'reset-password',
                context: { summary }
            })
        }
        
        return {
            message: 'Você receberá o e-mail de redefinição em breve!'
        }
    }

    async reset(dto: ResetPasswordDTO) {
        const hash = TokenHasher.getTokenHash(dto.token);
        const rk = RedisKeys.passwordResetToken(hash);
        const value = await this.redisService.getdel(rk);
        if (!value) {
            throw new Error(`Token inválido ou expirado.`);
        }
        const hashNewPass = await PasswordHasher.hash(dto.newPassword);
        await this.repository.attPasswordUser(hashNewPass, Number(value));
        return {
            message: 'ok'
        }
    }

}