import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import CategoriesController from './Categories/CategoriesController';
import CategoriesService from './Categories/CategoriesService';
import CategoriesRepository from './Categories/CategoriesRepository';
import MySQLDatabase from './Config/Database/MySQLDatabase';
import CreateCategory from './Categories/useCases/CreateCategory';
import GetCategories from './Categories/useCases/GetCategories';
import DeleteCategory from './Categories/useCases/DeleteCategory';
import UpdateCategory from './Categories/useCases/UpdateCategory';
import { LoggerMiddleware } from './Shared/Logger/logger.middleware';
import { BillsDueRepository } from './Dashboard/BillsDue/BillsDueRepository';
import { BillsDueService } from './Dashboard/BillsDue/BillsDueService';
import { CurrentBalanceRepository } from './Dashboard/CurrentBalance/CurrentBalanceRepository';
import { CurrentBalanceService } from './Dashboard/CurrentBalance/CurrentBalanceService';
import { ExpensesByCategoryRepository } from './Dashboard/ExpensesByCategory/ExpensesByCategoryRepository';
import { ExpensesByCategoryService } from './Dashboard/ExpensesByCategory/ExpensesByCategoryService';
import { DashboardServices } from './Dashboard/DashboardServices';
import { DashboardController } from './Dashboard/DashboardController';
import { MonthlyProgressServices } from './Dashboard/MonthlyProgress/MonthlyProgressServices';
import { MonthlyProgressRepository } from './Dashboard/MonthlyProgress/MonthlyProgressRepository';
import { AuthModule } from './Auth/auth.module';
import { UsersModule } from './Users/users.module';
import CreditCardStatementsService from './Dashboard/CreditCardStatements/CreditCardStatementsService';
import CreditCardStatementsRepository from './Dashboard/CreditCardStatements/CreditCardStatementsRepository';
import { UsersController } from './Users/UserController';
import { ConfigModule } from '@nestjs/config';
import { InvoicesModule } from './Finance/Invoices/invoices.module';
import { FinanceModule } from './Finance/finance.module';
import { DatabaseModule } from './Config/Database/database.module';
import { HealthCheckModule } from './Check/health-check.module';

const services = [
  CategoriesService,
];

const useCases = [
  GetCategories,
  CreateCategory,
  DeleteCategory,
  UpdateCategory,
];

const repositories = [
  CategoriesRepository,
]

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UsersModule,
    InvoicesModule,
    FinanceModule,
    DatabaseModule,
    HealthCheckModule
  ],
  controllers: [
    AppController,
    CategoriesController,
    DashboardController,
    UsersController
  ],
  providers: [
    AppService,
    ...services,
    ...useCases,
    ...repositories,
    MySQLDatabase,
    BillsDueRepository,
    BillsDueService,
    CurrentBalanceRepository,
    CurrentBalanceService,
    ExpensesByCategoryRepository,
    ExpensesByCategoryService,
    DashboardServices,
    MonthlyProgressServices,
    MonthlyProgressRepository,
    CreditCardStatementsService,
    CreditCardStatementsRepository
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
