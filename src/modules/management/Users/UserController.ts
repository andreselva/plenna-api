import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './UserService';
import UserDTO from './DTOs/UserDTO';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('user')
export class UsersController {
    constructor(
        private readonly service: UsersService
    ) { }

    // @Public()
    // @Post('register')
    // async createUser(@Body() user: UserDTO) {
    //     if (user) {
    //         return await this.service.createUser(user);
    //     }
    //     throw new UnauthorizedException("Você não pode usar esse serviço!");
    // }
}
