import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import PeriodoDTO from 'src/DTOs/PeriodoDTO';
import { InvoicesService } from './invoices.service';
import InvoiceSettingsDTO from './DTOs/invoice.settings.dto';

@Controller('invoices')
export class InvoicesController {
    constructor(
        private readonly service: InvoicesService
    ) { }

    @Get()
    async getInvoices(@Headers('x-periodo') periodo: string) {
        const newPeriodo = JSON.parse(periodo) as PeriodoDTO;
        const invoices = await this.service.getInvoices(newPeriodo);

        if (invoices) {
            return { invoices: invoices };
        }
    }

    @Get('/related/:idBankAccount')
    async searchForRelatedOpenInvoices(@Param('idBankAccount') idBankAccount: string) {
        if (idBankAccount && idBankAccount.length > 0) {
            return await this.service.getRelatedInvoicesIdBankAccount(idBankAccount);
        }
    }

    @Post('/create')
    createInvoices(@Body() invoiceSettings: InvoiceSettingsDTO) {
        try {
            if (invoiceSettings) {
                this.service.createInvoice(invoiceSettings);
            }
        } catch (err) {
            console.error(err);
        }
    }

}
