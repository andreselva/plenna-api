import { ForbiddenException, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthCookieOptions } from './AuthCookieOptions';
import { RefreshTokenMetadata } from './AuthRepository';
import { AuthService } from './AuthService';

@Injectable()
export class AuthHttpHelper {
  constructor(private readonly authService: AuthService) {}

  issueCsrfToken(res: Response): string {
    const csrfToken = this.authService.generateCsrfToken();
    res.cookie('csrf_token', csrfToken, AuthCookieOptions.csrfToken());
    return csrfToken;
  }

  assertCsrfProtection(req: Request) {
    const csrfCookie = req.cookies['csrf_token'] as string | undefined;
    const headerToken = this.extractCsrfHeader(req);
    if (!csrfCookie || !headerToken || csrfCookie !== headerToken) {
      throw new ForbiddenException('CSRF token ausente ou inválido.');
    }
  }

  readAccessToken(req: Request): string | null {
    return (req.cookies['access_token'] as string | undefined) ?? null;
  }

  readRefreshToken(req: Request): string | null {
    return (req.cookies['refresh_token'] as string | undefined) ?? null;
  }

  setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('access_token', accessToken, AuthCookieOptions.accessToken());
    res.cookie('refresh_token', refreshToken, AuthCookieOptions.refreshToken());
  }

  clearAuthCookies(res: Response) {
    res.clearCookie('access_token', AuthCookieOptions.clearToken());
    res.clearCookie('refresh_token', AuthCookieOptions.clearToken());
    res.clearCookie('csrf_token', AuthCookieOptions.clearCsrfToken());
  }

  getRequestMetadata(req: Request): RefreshTokenMetadata {
    const userAgentHeader = req.headers['user-agent'];
    return {
      ipAddress: req.ip ?? null,
      userAgent: Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader ?? null,
    };
  }

  private extractCsrfHeader(req: Request): string | undefined {
    const header = req.headers['x-csrf-token'] ?? req.headers['x-xsrf-token'];
    if (Array.isArray(header)) {
      return header[0];
    }
    return header;
  }
}
