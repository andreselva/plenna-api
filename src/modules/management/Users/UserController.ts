import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './UserService';
import UserDTO from './DTOs/UserDTO';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('user')
export class UsersController {}
