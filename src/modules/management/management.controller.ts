import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Put, UnauthorizedException } from '@nestjs/common';
import { ManagementService } from './management.service';
import { Public } from 'src/common/decorators/public.decorator';
import UserDTO from './Users/DTOs/UserDTO';
import UserPasswordResetDTO from './Users/DTOs/UserPasswordResetDTO';
import { UsersService } from './Users/UserService';
import { Role } from 'src/enum/role.enum';
import { Roles } from 'src/common/decorators/roles.decoratos';

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
    @Roles(Role.ADMIN)
    async createNewUserByScreen(@Body() user: UserDTO) {
        if (!user.password || user.password === undefined || user.password === null) {
            throw new BadRequestException(`Senha não informada!`);
        }
        return await this.service.registerUser(user);
    }

    @Get('/users')
    @Roles(Role.ADMIN)
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

    @Delete('/users/:userId')
    @Roles(Role.ADMIN)
    async deleteUser(
        @Param('userId') userId: number
    ) {
        return await this.usersService.deleteUser(userId);
    }

    @Put('/users')
    @Roles(Role.ADMIN)
    async updateUser(@Body() user: UserDTO) {
        return await this.usersService.updateUser(user);
    }
}
