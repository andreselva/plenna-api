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
import RevenuesController from './Finance/Revenues/RevenuesController';
import RevenuesService from './Finance/Revenues/RevenuesService';
import CreateRevenue from './Finance/Revenues/UseCases/CreateRevenue';
import GetRevenues from './Finance/Revenues/UseCases/GetRevenues';
import RevenuesRepository from './Finance/Revenues/RevenuesRepository';
import { ExpensesController } from './Finance/Expenses/ExpensesController';
import { GetExpenses } from './Finance/Expenses/UseCases/GetExpenses';
import { CreateExpense } from './Finance/Expenses/UseCases/CreateExpense';
import { ExpensesRepository } from './Finance/Expenses/ExpensesRepository';
import { DeleteExpense } from './Finance/Expenses/UseCases/DeleteExpense';
import { UpdateExpense } from './Finance/Expenses/UseCases/UpdateExpense';
import { DeleteRevenue } from './Finance/Revenues/UseCases/DeleteRevenue';
import { UpdateRevenue } from './Finance/Revenues/UseCases/UpdateRevenue';
import { ExpensesServices } from './Finance/Expenses/ExpensesServices';
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
import BankAccountsService from './Finance/BankAccounts/BankAccountsServices';
import GetBankAccounts from './Finance/BankAccounts/UseCases/GetBankAccounts';
import CreateBankAccount from './Finance/BankAccounts/UseCases/CreateBankAccount';
import BankAccountsRepository from './Finance/BankAccounts/BankAccountsRepository';
import BankAccountsController from './Finance/BankAccounts/BankAccountsController';
import DeleteBankAccount from './Finance/BankAccounts/UseCases/DeleteBankAccount';
import UpdateBankAccount from './Finance/BankAccounts/UseCases/UpdateBankAccount';
import CreditCardStatementsService from './Dashboard/CreditCardStatements/CreditCardStatementsService';
import CreditCardStatementsRepository from './Dashboard/CreditCardStatements/CreditCardStatementsRepository';

const services = [
  CategoriesService,
  RevenuesService,
  ExpensesServices,
  BankAccountsService
];

const useCases = [
  GetCategories,
  CreateCategory,
  DeleteCategory,
  UpdateCategory,
  CreateRevenue,
  GetRevenues,
  DeleteRevenue,
  UpdateRevenue,
  GetExpenses,
  CreateExpense,
  DeleteExpense,
  UpdateExpense,
  GetBankAccounts,
  CreateBankAccount,
  DeleteBankAccount,
  UpdateBankAccount,
];

const repositories = [
  CategoriesRepository,
  RevenuesRepository,
  ExpensesRepository,
  BankAccountsRepository,
]

@Module({
  imports: [],
  controllers: [
    AppController,
    CategoriesController,
    RevenuesController,
    ExpensesController,
    DashboardController,
    BankAccountsController,
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
