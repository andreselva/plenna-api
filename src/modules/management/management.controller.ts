import { Body, Controller, Get, Post, UnauthorizedException } from '@nestjs/common';
import { ManagementService } from './management.service';
import { Public } from 'src/common/decorators/public.decorator';
import UserDTO from './Users/DTOs/UserDTO';

@Controller('management')
export class ManagementController {
    constructor(
        private readonly service: ManagementService
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
        return await this.service.getUsers();
    }
}
