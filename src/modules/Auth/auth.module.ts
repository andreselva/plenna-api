import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './AuthService';
import { AuthController } from './AuthController';
import { JwtStrategy } from './JwtStrategy';
import AuthRepository from './AuthRepository';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthContextService } from './auth-context.service';
import { AuthControllerService } from './auth-controller.service';
import { AuthHttpHelper } from './auth-http.helper';
import { ManagementModule } from 'src/modules/management/management.module';
import { AuthRateLimitGuard } from 'src/common/guards/auth-rate-limit.guard';
import RequestPasswordResetController from './request-password-reset.controller';
import ResetPasswordService from './reset-password.service';
import { RedisModule } from '../redis/redis.module';
import { EmailModule } from '../email/email.module';

@Global()
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

    ManagementModule,
    RedisModule,
    EmailModule
  ],
  controllers: [AuthController, RequestPasswordResetController],
  providers: [
    AuthService,
    JwtStrategy,
    AuthRepository,
    MySQLDatabase,
    AuthContextService,
    AuthRateLimitGuard,
    ResetPasswordService,
    AuthControllerService,
    AuthHttpHelper
  ],
  exports: [
    PassportModule,  // para que outros módulos possam usar Guards
    JwtModule,       // se quiser injetar JwtService em outro lugar
    AuthService,     // para caso outro módulo queira chamar validações
    AuthContextService
  ],
})

export class AuthModule { }
