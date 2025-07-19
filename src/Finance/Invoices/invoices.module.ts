import { forwardRef, Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import InvoicesRepository from './invoices.repository';
import MySQLDatabase from 'src/Config/Database/MySQLDatabase';
import CreateInvoiceUseCase from './UseCases/CreateInvoiceUseCase';
import GetInvoicesUseCase from './UseCases/GetInvoicesUseCase';
import AssociateExpensesToInvoiceUseCase from './UseCases/AssociateExpensesToInvoice';
import { PaymentModule } from './Payment/payment.module';
import UpdateStatusInvoice from './UseCases/UpdateStatusInvoice';
@Module({
  imports: [forwardRef(() => PaymentModule)],
  providers: [
    InvoicesService,
    InvoicesRepository,
    CreateInvoiceUseCase,
    GetInvoicesUseCase,
    UpdateStatusInvoice,
    AssociateExpensesToInvoiceUseCase,
    MySQLDatabase],
  controllers: [InvoicesController],
  exports: [AssociateExpensesToInvoiceUseCase, InvoicesService]

})
export class InvoicesModule { }
