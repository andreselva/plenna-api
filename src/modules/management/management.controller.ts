import { Body, Controller, Get, Param, Patch, Post, UnauthorizedException } from '@nestjs/common';
import { ManagementService } from './management.service';
import { Public } from 'src/common/decorators/public.decorator';
import UserDTO from './Users/DTOs/UserDTO';
import UserPasswordResetDTO from './Users/DTOs/UserPasswordResetDTO';
import { UsersService } from './Users/UserService';

@Controller('management')
export class ManagementController {
    constructor(
        private readonly service: ManagementService,
        private readonly usersService: UsersService
    ) {}

    @Public() //Público para a rota de novo cadastro de cliente/usuário
    @Post('register-user')
    async register(@Body() user: UserDTO) {
        throw new UnauthorizedException();
        // return await this.service.registerUser(user)
    }

    @Post()
    async createNewUserByScreen(@Body() user: UserDTO) {
        return await this.service.registerUser(user);
    }

    @Get('/users')
    async getUsers() {
        return await this.usersService.getUsers();
    }

    @Patch('/users/reset-password/:userId')
    async resetPassword(
        @Param('userId') userId: number,
        @Body() dto: UserPasswordResetDTO,
    ) {
        await this.usersService.resetPassword(userId, dto);
        return { message: 'Senha atualizada com sucesso!' };
    }
}
