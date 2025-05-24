import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './AuthService';
import { AuthController } from './AuthController';
import { JwtStrategy } from './JwtStrategy';
import { UsersModule } from '../Users/users.module';
import AuthRepository from './AuthRepository';
import MySQLDatabase from 'src/Config/Database/MySQLDatabase';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),

    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
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
