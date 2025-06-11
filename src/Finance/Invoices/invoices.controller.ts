import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import PeriodoDTO from 'src/DTOs/PeriodoDTO';
import { InvoicesService } from './invoices.service';
import InvoiceSettingsDTO from './DTOs/invoice.settings.dto';

@Controller('invoices')
export class InvoicesController {
    constructor(
        private readonly service: InvoicesService
    ) { }

    @Get()
    getInvoices(@Headers('x-periodo') periodo: string) {
        const newPeriodo = JSON.parse(periodo) as PeriodoDTO;
        console.log(newPeriodo);
        return {
            invoices: [
                {
                    id: 1,
                    name: 'Fatura de Janeiro',
                    invoiceDueDate: '2023-01-31',
                    closingDate: '2023-02-05',
                    paymentDate: '2023-02-10',
                    status: 'Paga',
                    value: 1000,
                    expenses: [
                        { id: 1, name: 'Despesa Fixa A', value: 200, dueDate: '2023-01-10' },
                        { id: 2, name: 'Compra Online B', value: 300, dueDate: '2023-01-15' },
                        { id: 3, name: 'Supermercado C', value: 400, dueDate: '2023-01-20' },
                        { id: 4, name: 'Restaurante D', value: 100, dueDate: '2023-01-22' },
                        { id: 5, name: 'Assinatura Streaming E', value: 50, dueDate: '2023-01-05' },
                        { id: 6, name: 'Transporte F', value: 150, dueDate: '2023-01-12' },
                        { id: 7, name: 'Farmácia G', value: 80, dueDate: '2023-01-18' },
                        { id: 8, name: 'Manutenção H', value: 120, dueDate: '2023-01-25' },
                        { id: 9, name: 'Presente I', value: 70, dueDate: '2023-01-08' },
                        { id: 10, name: 'Educação J', value: 250, dueDate: '2023-01-14' },
                        { id: 11, name: 'Lazer K', value: 130, dueDate: '2023-01-28' },
                        { id: 12, name: 'Outros L', value: 50, dueDate: '2023-01-30' },
                    ]
                },
                {
                    id: 2,
                    name: 'Fatura de Fevereiro',
                    invoiceDueDate: '2023-02-28',
                    closingDate: '2023-03-05',
                    paymentDate: null, // Exemplo de fatura ainda não paga
                    status: 'Pendente',
                    value: 1200,
                    expenses: [
                        { id: 13, name: 'Despesa Fixa A', value: 200, dueDate: '2023-02-10' },
                        { id: 14, name: 'Compra Online M', value: 350, dueDate: '2023-02-15' },
                        { id: 15, name: 'Supermercado N', value: 450, dueDate: '2023-02-20' },
                        { id: 16, name: 'Restaurante O', value: 150, dueDate: '2023-02-22' },
                        { id: 17, name: 'Assinatura Streaming P', value: 50, dueDate: '2023-02-05' },
                    ]
                }
            ]
        };
    }

    @Get('/related')
    searchForRelatedOpenInvoices() {
        return {
            invoices: [
                {
                    id: 4,
                    name: 'faturinha',
                    invoiceDueDate: '2023-02-28',
                    closingDate: '2023-03-05',
                    paymentDate: null,
                    status: 'Pendente',
                    value: 1892,
                    expenses: [
                        { id: 25, name: 'Despesa Fixa A', value: 200, dueDate: '2023-02-10' },
                        { id: 29, name: 'Compra Online M', value: 350, dueDate: '2023-02-15' },
                        { id: 34, name: 'Supermercado N', value: 450, dueDate: '2023-02-20' },
                        { id: 34, name: 'Restaurante O', value: 150, dueDate: '2023-02-22' },
                        { id: 56, name: 'Assinatura Streaming P', value: 50, dueDate: '2023-02-05' },
                    ]
                }
            ]
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
