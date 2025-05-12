import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './UserService';
import UserDTO from './DTOs/UserDTO';

@Controller('user')
export class UsersController {
    constructor(
        private readonly service: UsersService
    ) { }

    @Post('register')
    async createUser(@Body() user: UserDTO) {
        return await this.service.createUser(user);
    }
}
