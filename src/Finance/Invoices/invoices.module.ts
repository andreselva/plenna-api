import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import InvoicesRepository from './invoices.repository';
import MySQLDatabase from 'src/Config/Database/MySQLDatabase';
import CreateInvoiceUseCase from './UseCases/CreateInvoiceUseCase';
import GetInvoicesUseCase from './UseCases/GetInvoicesUseCase';

@Module({
  providers: [InvoicesService, InvoicesRepository, CreateInvoiceUseCase, GetInvoicesUseCase, MySQLDatabase],
  controllers: [InvoicesController]
})
export class InvoicesModule { }
