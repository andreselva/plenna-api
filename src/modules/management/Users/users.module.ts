import { Module } from '@nestjs/common';
import UsersRepository from './UserRepository';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';
import { UsersController } from './UserController';
import { UsersService } from './UserService';

@Module({
  imports: [],
  providers: [
    UsersService,
    UsersRepository,
    MySQLDatabase,
  ],
  controllers: [UsersController],
  exports: [
    UsersService
  ],
})
export class UsersModule { }
