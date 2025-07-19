import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import InvoicesRepository from './invoices.repository';
import MySQLDatabase from 'src/Config/Database/MySQLDatabase';
import CreateInvoiceUseCase from './UseCases/CreateInvoiceUseCase';
import GetInvoicesUseCase from './UseCases/GetInvoicesUseCase';
import AssociateExpensesToInvoiceUseCase from './UseCases/AssociateExpensesToInvoice';
import { PaymentModule } from './Payment/payment.module';
@Module({
  imports: [PaymentModule],
  providers: [
    InvoicesService,
    InvoicesRepository,
    CreateInvoiceUseCase,
    GetInvoicesUseCase,
    AssociateExpensesToInvoiceUseCase,
    MySQLDatabase],
  controllers: [InvoicesController],
  exports: [AssociateExpensesToInvoiceUseCase]

})
export class InvoicesModule { }
