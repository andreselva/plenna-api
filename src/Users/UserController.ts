import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './UserService';
import UserDTO from './DTOs/UserDTO';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('user')
export class UsersController {
    constructor(
        private readonly service: UsersService
    ) { }

    @Public()
    @Post('register')
    async createUser(@Body() user: UserDTO) {
        return await this.service.createUser(user);
    }
}
