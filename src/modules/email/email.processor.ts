import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Inject } from '@nestjs/common';
import { Worker } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { EMAIL_JOB, EMAIL_QUEUE_NAME } from './email.constants';
import { MailerService } from './mailer/mailer.service';
import { REDIS_CONNECTION } from 'src/modules/redis/redis.module';
import type { Redis } from 'ioredis';
import { SendMailPayload, SendTemplatePayload } from './email.types';

@Injectable()
export class EmailProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmailProcessor.name);
  private worker!: Worker;

  constructor(
    private readonly config: ConfigService,
    private readonly mailer: MailerService,
    @Inject(REDIS_CONNECTION) private readonly redis: Redis,
  ) {}

  onModuleInit() {
    const concurrency = this.config.get<number>('email.concurrency') ?? 5;

    this.worker = new Worker(
      EMAIL_QUEUE_NAME,
      async (job) => {
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
        } else if (job.name === EMAIL_JOB.SEND_TEMPLATE) {
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
        } else {
          this.logger.warn(`Job desconhecido: ${job.name}`);
        }
      },
      { concurrency, connection: this.redis },
    );

    this.worker.on('completed', (job) => this.logger.log(`[OK] ${job.name} -> ${job.id}`));
    this.worker.on('failed', (job, err) =>
      this.logger.error(`[FAIL] ${job?.name} -> ${job?.id}: ${err.message}`, err.stack),
    );

    this.logger.log(`Email worker iniciado (concurrency=${concurrency})`);
  }

  async onModuleDestroy() {
    if (this.worker) await this.worker.close();
  }
}
