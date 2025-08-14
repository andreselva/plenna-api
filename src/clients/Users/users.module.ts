import { Module } from '@nestjs/common';
import UsersRepository from './UserRepository';
import MySQLDatabase from 'src/Config/Database/MySQLDatabase';
import { UsersController } from './UserController';
import { UsersService } from './UserService';
import { ClientsService } from '../clients.service';

@Module({
  imports: [ClientsService],
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
