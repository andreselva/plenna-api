// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './AuthService';
import { AuthController } from './AuthController';
import { JwtStrategy } from './JwtStrategy';

import { UsersModule } from '../Users/users.module';
import AuthRepository from './AuthRepository';
import MySQLDatabase from 'src/Config/Database/MySQLDatabase';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'chave-secreta',
      signOptions: { expiresIn: '1h' },
    }),

    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,     // lógica de validação e geração de token
    JwtStrategy,    // extrai o JWT do cookie e valida
    AuthRepository,
    MySQLDatabase
  ],
  exports: [
    PassportModule,  // para que outros módulos possam usar Guards
    JwtModule,       // se quiser injetar JwtService em outro lugar
    AuthService,     // para caso outro módulo queira chamar validações
  ],
})
export class AuthModule { }
