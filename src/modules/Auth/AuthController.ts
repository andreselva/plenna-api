import { Controller, Post, Body, UnauthorizedException, Res, Get, Req, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './AuthService';
import { LoginDto } from './DTOs/dto.login';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthCookieOptions } from './AuthCookieOptions';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @Public()
    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        try {
            const user = await this.authService.validateUser(loginDto.username, loginDto.password);
            if (!user) throw new UnauthorizedException('Credenciais inválidas');
            const { accessToken, refreshTokenGenerated } = await this.authService.generateTokens(user);
            res.cookie('access_token', accessToken, AuthCookieOptions.accessToken());
            res.cookie('refresh_token', refreshTokenGenerated, AuthCookieOptions.refreshToken());
            return { user };
        } catch (err) {
            if (err instanceof UnauthorizedException) {
                throw err;
            }
            throw new InternalServerErrorException();
        }

    }

    @Public()
    @Post('refresh')
    async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        try {
            const refreshToken = req.cookies['refresh_token'] as string;
            if (!refreshToken) throw new UnauthorizedException();
            const { accessToken, newRefreshToken } = await this.authService.refreshAccessToken(refreshToken);
            res.cookie('access_token', accessToken, AuthCookieOptions.accessToken());
            res.cookie('refresh_token', newRefreshToken, AuthCookieOptions.refreshToken());
            return { message: 'ok', statusCode: HttpStatus.OK }
        } catch (err) {
            console.error(`Erro: ${err}`);
            if (err instanceof UnauthorizedException) {
                throw err;
            }
            throw new InternalServerErrorException();
        }
    }

    @Public()
    @Post('logout')
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        try {
            const refreshToken = req.cookies['refresh_token'] as string;
            if (refreshToken) {
                await this.authService.revokeRefreshToken(refreshToken);
            }
            res.clearCookie('access_token', AuthCookieOptions.clearToken());
            res.clearCookie('refresh_token', AuthCookieOptions.clearToken())
            return { message: 'Logout realizado' };
        } catch (err) {
            console.error('Erro:', err);
            try {
                res.clearCookie('access_token', AuthCookieOptions.clearToken());
                res.clearCookie('refresh_token', AuthCookieOptions.clearToken())
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
}
