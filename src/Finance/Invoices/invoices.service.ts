import { Injectable } from '@nestjs/common';
import InvoiceSettingsDTO from './DTOs/invoice.settings.dto';
import Invoice from './Entity/invoice';
import InvoicesRepository from './invoices.repository';
import { DateTime } from "luxon";

@Injectable()
export class InvoicesService {
    constructor(
        private readonly repository: InvoicesRepository
    ) { }

    async create(invoiceSettings: InvoiceSettingsDTO) {
        try {
            const currentDate = DateTime.now();
            const currentClosingDate = currentDate.set({ day: invoiceSettings.closingDate }).startOf('day').toISODate() as string;
            const currentDueDate = currentDate.set({ day: invoiceSettings.dueDate }).startOf('day').toISODate() as string;

            const entity = new Invoice(
                currentClosingDate,
                currentDueDate,
                invoiceSettings.idAccount,
                invoiceSettings.nameAccount
            );

            if (entity) {
                await this.repository.createInvoice(entity);
            }
        } catch (err) {
            console.error(err);
        }
    }
}
