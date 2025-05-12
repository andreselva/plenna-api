import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './AuthService';
import { AuthController } from './AuthController';
import { JwtStrategy } from './JwtStrategy';
import { UsersModule } from '../Users/users.module';
import { UsersService } from 'src/Users/UserService';
import UsersRepository from 'src/Users/UserRepository';
import MySQLDatabase from 'src/Config/Database/MySQLDatabase';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'chave-secreta',
      signOptions: { expiresIn: '1h' },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersService, UsersRepository, MySQLDatabase],
  exports: [AuthService], // Exporte se precisar usar em outros módulos
})
export class AuthModule { }
