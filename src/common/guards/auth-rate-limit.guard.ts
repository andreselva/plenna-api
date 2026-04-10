import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import RedisService from 'src/modules/redis/redis-service';

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
    private static readonly WINDOW_SECONDS = 60;
    private static readonly MAX_ATTEMPTS = 5;
    private readonly logger = new Logger(AuthRateLimitGuard.name);

    constructor(private readonly redisService: RedisService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const key = this.createKey(request);

        try {
            const attempts = await this.redisService.incr(key);
            if (attempts === 1) {
                await this.redisService.expire(key, AuthRateLimitGuard.WINDOW_SECONDS);
            }

            if (attempts > AuthRateLimitGuard.MAX_ATTEMPTS) {
                throw new HttpException('Limite de tentativas excedido. Tente novamente em instantes.', HttpStatus.TOO_MANY_REQUESTS);
            }

            return true;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            this.logger.warn('Falha ao consultar rate limit no Redis. Seguindo sem bloqueio.');
            return true;
        }
    }

    private createKey(request: Request): string {
        const ip = this.extractClientIp(request);
        return `auth:rate-limit:${request.path}:${ip}`;
    }

    private extractClientIp(request: Request): string {
        const forwarded = request.headers['x-forwarded-for'];
        if (typeof forwarded === 'string' && forwarded.length > 0) {
            return forwarded.split(',')[0].trim();
        }

        if (Array.isArray(forwarded) && forwarded.length > 0) {
            return forwarded[0];
        }

        return request.ip ?? 'unknown';
    }
}
