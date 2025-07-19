import { Injectable } from '@nestjs/common';
import CreateInvoiceUseCase from './UseCases/CreateInvoiceUseCase';
import InvoiceSettingsDTO from './DTOs/invoice.settings.dto';
import GetInvoicesUseCase from './UseCases/GetInvoicesUseCase';
import PeriodoDTO from 'src/DTOs/PeriodoDTO';
import UpdateStatusInvoice from './UseCases/UpdateStatusInvoice';

@Injectable()
export class InvoicesService {
    constructor(
        private readonly createInvoiceUC: CreateInvoiceUseCase,
        private readonly getInvoicesUC: GetInvoicesUseCase,
        private readonly updateInvoiceStatusUC: UpdateStatusInvoice
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

    async updateInvoiceStatus(id: number, invoiceValue: number) {
        return await this.updateInvoiceStatusUC.update(id, invoiceValue);
    }
}
