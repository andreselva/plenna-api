import { Injectable } from "@nestjs/common";
import RequestResetPasswordDTO from "./DTOs/request-reset-password.dto";
import AuthRepository from "./AuthRepository";
import TokenHasher from "src/Shared/Utils/Secutiry/TokenHasher";
import RedisService from "../redis/redis-service";
import { RedisKeys } from "../redis/redis.keys";
import { EmailService } from "../email/email.service";

export interface ResetPasswordSummary {
    name: string;
    expireMinutes: number;
    resetLink: string;
    year: number;
}

export class ResetUserDTO {
    name: string;
    email: string;
    username: string
}

@Injectable()
export default class ResetPasswordService {
    constructor(
        private readonly repository: AuthRepository,
        private readonly redisService: RedisService,
        private readonly emailService: EmailService
    ) {}

    async process(dto: RequestResetPasswordDTO) {
        const result = await this.repository.getUserByEmailAndUsername(dto);
        if (result) {
            const { rawToken, tokenHash } = TokenHasher.getTokenByPasswordReset();
            const rk = RedisKeys.resetUserPasswordHash(tokenHash);
            await this.redisService.set(rk, tokenHash, 18000);//5 minutos
            
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

}