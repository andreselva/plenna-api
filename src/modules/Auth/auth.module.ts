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
import { ManagementModule } from 'src/modules/management/management.module';
import { AuthRateLimitGuard } from 'src/common/guards/auth-rate-limit.guard';

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

    ManagementModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    AuthRepository,
    MySQLDatabase,
    AuthContextService,
    AuthRateLimitGuard
  ],
  exports: [
    PassportModule,  // para que outros módulos possam usar Guards
    JwtModule,       // se quiser injetar JwtService em outro lugar
    AuthService,     // para caso outro módulo queira chamar validações
    AuthContextService
  ],
})

export class AuthModule { }
