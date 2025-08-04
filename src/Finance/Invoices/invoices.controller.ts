import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import PeriodoDTO from 'src/DTOs/PeriodoDTO';
import { InvoicesService } from './invoices.service';
import InvoiceSettingsDTO from './DTOs/invoice.settings.dto';

@Controller('invoices')
export class InvoicesController {
    constructor(
        private readonly service: InvoicesService
    ) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async getInvoices(@Headers('x-periodo') periodo: string) {
        const newPeriodo = JSON.parse(periodo) as PeriodoDTO;
        return await this.service.getInvoices(newPeriodo);
    }

    @Get('/related/:idBankAccount')
    @HttpCode(HttpStatus.OK)
    async searchForRelatedOpenInvoices(@Param('idBankAccount') idBankAccount: string) {
        if (idBankAccount && idBankAccount.length > 0) {
            return await this.service.getRelatedInvoicesIdBankAccount(idBankAccount);
        }
    }

    @Post('/create')
    @HttpCode(HttpStatus.CREATED)
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
