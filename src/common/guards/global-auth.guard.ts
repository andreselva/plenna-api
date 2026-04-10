import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from 'src/modules/Auth/JwtAuthGuard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Request } from 'express';

@Injectable()
export class GlobalAuthGuard extends JwtAuthGuard {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest<Request>();
        this.assertRequestOrigin(request);
        this.validateCsrfToken(request);
        return super.canActivate(context);
    }

    private validateCsrfToken(request: Request) {
        const method = request.method?.toUpperCase();
        if (!method || ['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            return;
        }

        const csrfCookie = request.cookies?.['csrf_token'];
        const csrfHeader = this.extractCsrfHeader(request);
        if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
            throw new ForbiddenException('CSRF token ausente ou inválido.');
        }
    }

    private extractCsrfHeader(request: Request): string | undefined {
        const header = request.headers['x-csrf-token'] ?? request.headers['x-xsrf-token'];
        if (Array.isArray(header)) {
            return header[0];
        }
        return header;
    }

    private assertRequestOrigin(request: Request) {
        if (process.env.NODE_ENV === 'development') {
            return;
        }

        const allowedOrigins = this.getAllowedOrigins();
        if (allowedOrigins.length === 0) {
            return;
        }

        const origin = this.extractOrigin(request);
        if (origin && !allowedOrigins.includes(origin)) {
            throw new ForbiddenException('Origem não autorizada.');
        }
    }

    private extractOrigin(request: Request): string | undefined {
        const originHeader = request.headers.origin;
        if (typeof originHeader === 'string') {
            return originHeader;
        }

        const refererHeader = request.headers.referer;
        const referer = Array.isArray(refererHeader) ? refererHeader[0] : refererHeader;

        if (typeof referer !== 'string' || referer.length === 0) {
            return undefined;
        }

        try {
            const url = new URL(referer);
            return `${url.protocol}//${url.host}`;
        } catch {
            return undefined;
        }
    }
    
    private getAllowedOrigins(): string[] {
        const fromEnv = process.env.CSRF_ALLOWED_ORIGINS;
        const defaults = ['https://plenna.me', 'https://app.plenna.me'];
        const raw = fromEnv ? fromEnv.split(',') : defaults;
        return raw.map((origin) => origin.trim()).filter((origin) => origin.length > 0);
    }
}
