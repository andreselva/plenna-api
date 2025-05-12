import { Controller, Post, Body, UnauthorizedException, Res, Get, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './AuthService';
import { LoginDto } from './DTOs/dto.login';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @Public()
    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.authService.validateUser(
            loginDto.username,
            loginDto.password
        );
        if (!user) throw new UnauthorizedException('Credenciais inválidas');

        const { accessToken, refreshToken } = await this.authService.generateTokens(user);

        // Define o cookie do Access Token
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: false, // Defina como true em produção com HTTPS
            sameSite: 'lax',
            maxAge: 900 * 1000,//15min
        });

        // Define o cookie do Refresh Token
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: false, // Defina como true em produção com HTTPS
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        });

        return { user };
    }

    @Public()
    @Post('refresh')
    async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refresh_token'] as string;
        if (!refreshToken) throw new UnauthorizedException('Refresh token não fornecido');

        const { accessToken, newRefreshToken } = await this.authService.refreshAccessToken(refreshToken);

        // Atualiza o cookie do Access Token
        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: false, // Defina como true em produção com HTTPS
            sameSite: 'lax',
            maxAge: 900 * 1000, // 15min
        });

        // Atualiza o cookie do Refresh Token
        res.cookie('refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: false, // Defina como true em produção com HTTPS
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        });

        return { message: 'Access token renovado' };
    }

    @Public()
    @Post('logout')
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refresh_token'] as string;

        if (refreshToken) {
            await this.authService.revokeRefreshToken(refreshToken);
        }

        res.clearCookie('access_token', {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
        });
        res.clearCookie('refresh_token', {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
        })
        return { message: 'Logout realizado' };
    }

    @Get()
    async getAuthenticatedUser(@Req() req: Request) {
        const token = req.cookies['access_token'] as string;
        if (!token) throw new UnauthorizedException('Sem token');

        const user = await this.authService.getUserFromToken(token);
        if (!user) throw new UnauthorizedException('Usuário não autenticado');

        return { user };
    }
}
