import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthRateLimitGuard } from 'src/common/guards/auth-rate-limit.guard';
import { LoginDto } from './DTOs/dto.login';
import { AuthControllerService } from './auth-controller.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authControllerService: AuthControllerService) {}

    @Public()
    @Post('login')
    @UseGuards(AuthRateLimitGuard)
    async login(@Body() loginDto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        return this.authControllerService.login(loginDto, req, res);
    }

    @Public()
    @Post('refresh')
    @UseGuards(AuthRateLimitGuard)
    async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        return this.authControllerService.refreshToken(req, res);
    }

    @Public()
    @Post('logout')
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        return this.authControllerService.logout(req, res);
    }

    @Get()
    async getAuthenticatedUser(@Req() req: Request) {
        return this.authControllerService.getAuthenticatedUser(req);
    }
}
