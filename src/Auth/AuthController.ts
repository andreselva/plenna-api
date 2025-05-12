import {
    Controller, Post, Body, UnauthorizedException,
    Res, Get, Req
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './AuthService';
import { LoginDto } from './DTOs/dto.login';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

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

        const jwt = this.authService.generateToken(user);

        res.cookie('access_token', jwt, {
            httpOnly: true,
            secure: false,       // em dev sem HTTPS
            sameSite: 'lax',     // permite enviar em GET/POST do seu front
            maxAge: 3_600_000,   // 1h
        });

        return { user };
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('access_token', {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
        });
        return { message: 'Logout realizado' };
    }

    @Get()
    async getAuthenticatedUser(@Req() req: Request) {
        const token = req.cookies['access_token'];
        if (!token) throw new UnauthorizedException('Sem token');

        const user = await this.authService.getUserFromToken(token);
        if (!user) throw new UnauthorizedException('Usuário não autenticado');

        return { user };
    }
}
