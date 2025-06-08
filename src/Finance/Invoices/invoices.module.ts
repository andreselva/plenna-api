import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import InvoicesRepository from './invoices.repository';
import MySQLDatabase from 'src/Config/Database/MySQLDatabase';

@Module({
  providers: [InvoicesService, InvoicesRepository, MySQLDatabase],
  controllers: [InvoicesController]
})
export class InvoicesModule { }
