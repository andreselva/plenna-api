import { Controller, Get, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('email')
export class EmailController {
  constructor(private readonly email: EmailService) {}

  // GET /email/test?to=andre@exemplo.com
  @Public()
  @Get('test')
  async test(@Query('to') to: string) {
    const id = await this.email.enqueueTemplate({
      to,
      subject: 'Teste Plenna - Invoice demo',
      template: 'invoice',
      context: {
        name: 'André',
        invoiceNumber: 'INV-2025-0001',
        amount: '349.90',
        dueDate: '25/09/2025',
        paymentLink: 'https://plenna.app/p/INV-2025-0001',
      },
    });
    return { ok: true, jobId: id };
  }
}
