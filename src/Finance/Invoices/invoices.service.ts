import { Injectable } from '@nestjs/common';
import CreateInvoiceUseCase from './UseCases/CreateInvoiceUseCase';
import InvoiceSettingsDTO from './DTOs/invoice.settings.dto';
import GetInvoicesUseCase from './UseCases/GetInvoicesUseCase';
import PeriodoDTO from 'src/DTOs/PeriodoDTO';

@Injectable()
export class InvoicesService {
    constructor(
        private readonly createInvoiceUC: CreateInvoiceUseCase,
        private readonly getInvoicesUC: GetInvoicesUseCase,
    ) { }

    async createInvoice(invoiceSettings: InvoiceSettingsDTO) {
        return this.createInvoiceUC.create(invoiceSettings);
    }

    async getRelatedInvoicesIdBankAccount(idBankAccount: string) {
        return await this.getInvoicesUC.getRelatedInvoiceBankAccount(Number(idBankAccount));
    }

    async getInvoices(periodo: PeriodoDTO) {
        return await this.getInvoicesUC.get(periodo);
    }
}
