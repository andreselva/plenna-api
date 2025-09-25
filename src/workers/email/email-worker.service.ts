import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { MailerService } from 'src/modules/email/mailer/mailer.service';
import { EMAIL_JOB } from 'src/modules/email/email.constants';
import { SendMailPayload, SendTemplatePayload } from 'src/modules/email/email.types';

type EmailJob = Job<SendMailPayload | SendTemplatePayload>;

@Injectable()
export class EmailWorkerService {
  private readonly logger = new Logger(EmailWorkerService.name);

  constructor(private readonly mailer: MailerService) {}

  async process(job: EmailJob): Promise<void> {
    if (job.name === EMAIL_JOB.SEND_MAIL) {
      const data = job.data as SendMailPayload;
      await this.mailer.sendRaw({
        to: data.to,
        subject: data.subject,
        html: data.html,
        cc: data.cc,
        bcc: data.bcc,
        attachments: data.attachments,
      });
      return;
    }

    if (job.name === EMAIL_JOB.SEND_TEMPLATE) {
      const data = job.data as SendTemplatePayload;
      await this.mailer.sendTemplate({
        to: data.to,
        subject: data.subject,
        template: data.template,
        context: data.context,
        cc: data.cc,
        bcc: data.bcc,
        attachments: data.attachments,
      });
      return;
    }

    this.logger.warn(`Job desconhecido: ${job.name}`);
  }
}
