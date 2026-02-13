import { Controller, Post, Body, UnauthorizedException, Res, Get, Req, HttpStatus, InternalServerErrorException, ForbiddenException, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './AuthService';
import { LoginDto } from './DTOs/dto.login';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthCookieOptions } from './AuthCookieOptions';
import { AuthRateLimitGuard } from 'src/common/guards/auth-rate-limit.guard';
import { RefreshTokenMetadata } from './AuthRepository';
import { ClientModulesService } from '../client-modules/client-modules.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private readonly clientModuleService: ClientModulesService
    ) { }

    @Public()
    @Post('login')
    @UseGuards(AuthRateLimitGuard)
    async login(@Body() loginDto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        try {
            const user = await this.authService.validateUser(loginDto.username, loginDto.password);
            if (!user) throw new UnauthorizedException('Credenciais inválidas');
            const metadata = this.getRequestMetadata(req);
            const { accessToken, refreshTokenGenerated } = await this.authService.generateTokens(user, metadata);
            res.cookie('access_token', accessToken, AuthCookieOptions.accessToken());
            res.cookie('refresh_token', refreshTokenGenerated, AuthCookieOptions.refreshToken());
            const csrfToken = this.issueCsrfToken(res);
            return { user, csrfToken };
        } catch (err) {
            if (err instanceof UnauthorizedException) {
                throw err;
            }
            throw new InternalServerErrorException();
        }

    }

    @Public()
    @Post('refresh')
    @UseGuards(AuthRateLimitGuard)
    async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        try {
            this.assertCsrfProtection(req);
            const refreshToken = req.cookies['refresh_token'] as string;
            if (!refreshToken) throw new UnauthorizedException();
            const metadata = this.getRequestMetadata(req);
            const { accessToken, newRefreshToken } = await this.authService.refreshAccessToken(refreshToken, metadata);
            res.cookie('access_token', accessToken, AuthCookieOptions.accessToken());
            res.cookie('refresh_token', newRefreshToken, AuthCookieOptions.refreshToken());
            const csrfToken = this.issueCsrfToken(res);
            return { message: 'ok', statusCode: HttpStatus.OK, csrfToken }
        } catch (err) {
            console.error(`Erro: ${err}`);
            if (err instanceof UnauthorizedException || err instanceof ForbiddenException) {
                throw err;
            }
            throw new InternalServerErrorException();
        }
    }

    @Public()
    @Post('logout')
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        try {
            this.assertCsrfProtection(req);
            const refreshToken = req.cookies['refresh_token'] as string;
            if (refreshToken) {
                await this.authService.revokeRefreshToken(refreshToken);
            }
            this.clientModuleService.deleteModulesTreeFromCache();
            res.clearCookie('access_token', AuthCookieOptions.clearToken());
            res.clearCookie('refresh_token', AuthCookieOptions.clearToken());
            res.clearCookie('csrf_token', AuthCookieOptions.clearCsrfToken());
            return { message: 'Logout realizado' };
        } catch (err) {
            console.error('Erro:', err);
            try {
                res.clearCookie('access_token', AuthCookieOptions.clearToken());
                res.clearCookie('refresh_token', AuthCookieOptions.clearToken());
                res.clearCookie('csrf_token', AuthCookieOptions.clearCsrfToken());
            } catch (error) {
                console.error('Erro ao tentar limpar as credenciais', error);
            }

            throw new InternalServerErrorException("Falha ao realizar logout")
        }
    }

    @Get()
    async getAuthenticatedUser(@Req() req: Request) {
        try {
            const token = req.cookies['access_token'] as string;
            if (!token) throw new UnauthorizedException();

            const user = await this.authService.getUserFromToken(token);
            if (!user) throw new UnauthorizedException();

            return { user };
        } catch (err) {
            console.error("Erro", err);
            if (err instanceof UnauthorizedException) {
                throw err;
            }
            throw new InternalServerErrorException();
        }
    }

    private issueCsrfToken(res: Response): string {
        const csrfToken = this.authService.generateCsrfToken();
        res.cookie('csrf_token', csrfToken, AuthCookieOptions.csrfToken());
        return csrfToken;
    }

    private assertCsrfProtection(req: Request) {
        const csrfCookie = req.cookies['csrf_token'] as string | undefined;
        const headerToken = this.extractCsrfHeader(req);
        if (!csrfCookie || !headerToken || csrfCookie !== headerToken) {
            throw new ForbiddenException('CSRF token ausente ou inválido.');
        }
    }

    private extractCsrfHeader(req: Request): string | undefined {
        const header = req.headers['x-csrf-token'] ?? req.headers['x-xsrf-token'];
        if (Array.isArray(header)) {
            return header[0];
        }
        return header;
    }

    private getRequestMetadata(req: Request): RefreshTokenMetadata {
        const userAgentHeader = req.headers['user-agent'];
        return {
            ipAddress: req.ip ?? null,
            userAgent: Array.isArray(userAgentHeader) ? userAgentHeader[0] : userAgentHeader ?? null,
        };
    }
}
