import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './Shared/Logger/logger.middleware';
import { AuthModule } from './modules/Auth/auth.module';
import { DatabaseModule } from './modules/Config/Database/database.module';
import { HealthCheckModule } from './modules/Check/health-check.module';
import { ManagementModule } from './modules/management/management.module';
import { FinanceModule } from './modules/Finance/finance.module';
import { CategoryModule } from './modules/Categories/category.module';
import { DashboardModule } from './modules/Dashboard/dashboard.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { EmailModule } from './modules/email/email.module';
import { RedisModule } from './modules/redis/redis.module';
import { ClientModulesModule } from './modules/client-modules/client-modules.module';
import { SaasModule } from './modules/saas/saas.module';
import { BankAccountsModule } from './modules/Finance/core/bank-accounts/bank-accounts.module';
import { LedgerModule } from './modules/Finance/core/ledger/ledger.module';
import { LedgerBuildModule } from './modules/Finance/core/ledger-build/ledger-build.module';
import { BillingModule } from './modules/billing/billing.module';
import { CustomersModule } from './modules/customers/customers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    FinanceModule,
    DatabaseModule,
    HealthCheckModule,
    ManagementModule,
    DashboardModule,
    CategoryModule,
    IntegrationsModule,
    ReportsModule,
    AppointmentsModule,
    EmailModule,
    RedisModule,
    ClientModulesModule,
    SaasModule,
    BankAccountsModule,
    LedgerModule,
    LedgerBuildModule,
    BillingModule,
    CustomersModule
  ],
  controllers: [
    AppController,
  ],

  providers: [
    AppService,
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
