import { Module } from '@nestjs/common';
import UsersRepository from './UserRepository';
import MySQLDatabase from 'src/Config/Database/MySQLDatabase';
import { UsersController } from './UserController';
import { UsersService } from './UserService';

@Module({
  providers: [
    UsersService,
    UsersRepository,
    MySQLDatabase,
  ],
  controllers: [UsersController]
})
export class UsersModule { }
