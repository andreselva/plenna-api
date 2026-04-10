import { HttpStatus, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './AuthService';
import { LoginDto } from './DTOs/dto.login';
import { AuthHttpHelper } from './auth-http.helper';

@Injectable()
export class AuthControllerService {
    private readonly logger = new Logger(AuthControllerService.name);

    constructor(
        private readonly authService: AuthService,
        private readonly authHttpHelper: AuthHttpHelper,
    ) {}

    async login(loginDto: LoginDto, req: Request, res: Response) {
        try {
            const user = await this.authService.validateUser(loginDto.username, loginDto.password);
            if (!user) throw new UnauthorizedException('Credenciais inválidas');

            const metadata = this.authHttpHelper.getRequestMetadata(req);
            const { accessToken, refreshTokenGenerated } = await this.authService.generateTokens(user, metadata);

            this.authHttpHelper.setAuthCookies(res, accessToken, refreshTokenGenerated);
            const csrfToken = this.authHttpHelper.issueCsrfToken(res);

            return { user, csrfToken };
        } catch (err) {
            if (err instanceof UnauthorizedException) {
                throw err;
            }

            this.logger.error('Falha inesperada ao realizar login.');
            throw new InternalServerErrorException();
        }
    }

    async refreshToken(req: Request, res: Response) {
        try {
            this.authHttpHelper.assertCsrfProtection(req);
            const refreshToken = this.authHttpHelper.readRefreshToken(req);
            if (!refreshToken) throw new UnauthorizedException();

            const metadata = this.authHttpHelper.getRequestMetadata(req);
            const { accessToken, newRefreshToken } = await this.authService.refreshAccessToken(refreshToken, metadata);

            this.authHttpHelper.setAuthCookies(res, accessToken, newRefreshToken);
            const csrfToken = this.authHttpHelper.issueCsrfToken(res);

            return { message: 'ok', statusCode: HttpStatus.OK, csrfToken };
        } catch (err) {
            if (err instanceof UnauthorizedException) {
                throw err;
            }

            this.logger.error('Falha inesperada ao renovar sessão.');
            throw new InternalServerErrorException();
        }
    }

    async logout(req: Request, res: Response) {
        try {
            this.authHttpHelper.assertCsrfProtection(req);

            const refreshToken = this.authHttpHelper.readRefreshToken(req);
            if (refreshToken) {
                await this.authService.revokeRefreshToken(refreshToken);
            }

            this.authHttpHelper.clearAuthCookies(res);
            return { message: 'Logout realizado' };
        } catch {
            this.authHttpHelper.clearAuthCookies(res);
            this.logger.error('Falha ao realizar logout.');
            throw new InternalServerErrorException('Falha ao realizar logout');
        }
    }

    async getAuthenticatedUser(req: Request) {
        try {
            const token = this.authHttpHelper.readAccessToken(req);
            if (!token) throw new UnauthorizedException();

            const user = await this.authService.getUserFromToken(token);
            return { user };
        } catch (err) {
            if (err instanceof UnauthorizedException) {
                throw err;
            }

            this.logger.error('Falha inesperada ao obter usuário autenticado.');
            throw new InternalServerErrorException();
        }
    }
}
