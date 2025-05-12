import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './AuthService';
import { LoginDto } from './DTOs/dto.login';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }
        return this.authService.login(user);
    }
}
