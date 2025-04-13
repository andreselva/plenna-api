import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import CategoriesController from './Categories/CategoriesController';
import CategoriesService from './Categories/CategoriesService';
import CategoriesRepository from './Categories/CategoriesRepository';
import MySQLDatabase from './Database/MySQLDatabase';
import CreateCategory from './Categories/useCases/CreateCategory';
import GetCategories from './Categories/useCases/GetCategories';
import DeleteCategory from './Categories/useCases/DeleteCategory';
import UpdateCategory from './Categories/useCases/UpdateCategory';
import { LoggerMiddleware } from './Logger/logger.middleware';
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
  ],
  providers: [
    AppService,
    ...services,
    ...useCases,
    ...repositories,
    MySQLDatabase,
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
