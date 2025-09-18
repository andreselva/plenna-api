import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';

interface RateLimitRecord {
    count: number;
    expiresAt: number;
}

@Injectable()
export class AuthRateLimitGuard implements CanActivate {
    private static readonly WINDOW_MS = 60_000;
    private static readonly MAX_ATTEMPTS = 5;
    private static readonly attempts: Map<string, RateLimitRecord> = new Map();

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const key = this.createKey(request);
        const now = Date.now();
        const record = AuthRateLimitGuard.attempts.get(key);

        if (!record || record.expiresAt < now) {
            AuthRateLimitGuard.attempts.set(key, {
                count: 1,
                expiresAt: now + AuthRateLimitGuard.WINDOW_MS,
            });
            return true;
        }

        if (record.count >= AuthRateLimitGuard.MAX_ATTEMPTS) {
            throw new HttpException('Limite de tentativas excedido. Tente novamente em instantes.', HttpStatus.TOO_MANY_REQUESTS);
        }

        record.count += 1;
        AuthRateLimitGuard.attempts.set(key, record);
        return true;
    }

    private createKey(request: Request): string {
        const ip = this.extractClientIp(request);
        return `${request.path}:${ip}`;
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
