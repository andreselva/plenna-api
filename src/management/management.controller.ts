import { Body, Controller, Post } from '@nestjs/common';
import { ManagementService } from './management.service';
import { Public } from 'src/common/decorators/public.decorator';
import UserDTO from './Users/DTOs/UserDTO';

@Controller('management')
export class ManagementController {
    constructor(
        private readonly service: ManagementService
    ) {}

    @Public()
    @Post('register-user')
    async create(@Body() user: UserDTO) {
        return await this.service.registerUser(user)
    }
}
