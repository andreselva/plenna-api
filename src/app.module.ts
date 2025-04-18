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
import RevenuesController from './Revenues/RevenuesController';
import RevenuesService from './Revenues/RevenuesService';
import CreateRevenue from './Revenues/UseCases/CreateRevenue';
import GetRevenues from './Revenues/UseCases/GetRevenues';
import RevenuesRepository from './Revenues/RevenuesRepository';
import { ExpensesController } from './Expenses/ExpensesController';
import { GetExpenses } from './Expenses/UseCases/GetExpenses';
import { CreateExpense } from './Expenses/UseCases/CreateExpense';
import { ExpensesRepository } from './Expenses/ExpensesRepository';
import { ExpensesServices } from './Expenses/ExpensesServices';
import { DeleteExpense } from './Expenses/UseCases/DeleteExpense';
import { UpdateExpense } from './Expenses/UseCases/UpdateExpense';
import { DeleteRevenue } from './Revenues/UseCases/DeleteRevenue';
import { UpdateRevenue } from './Revenues/UseCases/UpdateRevenue';
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

const services = [
  CategoriesService,
  RevenuesService,
  ExpensesServices,
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
];

const repositories = [
  CategoriesRepository,
  RevenuesRepository,
  ExpensesRepository,
]

@Module({
  imports: [],
  controllers: [
    AppController,
    CategoriesController,
    RevenuesController,
    ExpensesController,
    DashboardController
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
    MonthlyProgressRepository
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
