import { Injectable } from '@nestjs/common';
import CreateInvoiceUseCase from './UseCases/CreateInvoiceUseCase';
import InvoiceSettingsDTO from './DTOs/invoice.settings.dto';

@Injectable()
export class InvoicesService {
    constructor(
        private readonly createInvoiceUC: CreateInvoiceUseCase
    ) { }

    async createInvoice(invoiceSettings: InvoiceSettingsDTO) {
        return this.createInvoiceUC.create(invoiceSettings);
    }

}
