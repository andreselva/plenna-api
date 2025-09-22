import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, JobsOptions } from 'bullmq';
import { EMAIL_JOB, EMAIL_QUEUE_TOKEN } from './email.constants';
import { SendMailPayload, SendTemplatePayload } from './email.types';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly attempts: number;
  private readonly backoffMs: number;

  constructor(
    @Inject(EMAIL_QUEUE_TOKEN) private readonly queue: Queue,
    private readonly config: ConfigService,
  ) {
    this.attempts = this.config.get<number>('email.attempts') ?? 5;
    this.backoffMs = this.config.get<number>('email.backoffMs') ?? 10000;
  }

  private defaultJobOptions(overrides?: JobsOptions): JobsOptions {
    return {
      attempts: this.attempts,
      backoff: { type: 'exponential', delay: this.backoffMs },
      removeOnComplete: 1000,
      removeOnFail: 5000,
      ...overrides,
    };
  }

  async enqueueRaw(payload: SendMailPayload, opts?: JobsOptions) {
    const jobId = `send-mail-${Date.now()}-${Math.random().toString(36).slice(2)}`; // sem ':'
    const job = await this.queue.add(EMAIL_JOB.SEND_MAIL, payload, this.defaultJobOptions({ jobId, ...opts }));
    this.logger.log(`Enfileirado SEND_MAIL (${job.id}) para ${JSON.stringify(payload.to)}`);
    return job.id;
  }

  async enqueueTemplate(payload: SendTemplatePayload, opts?: JobsOptions) {
    const jobId = `send-template-${payload.template}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const job = await this.queue.add(EMAIL_JOB.SEND_TEMPLATE, payload, this.defaultJobOptions({ jobId, ...opts }));
    this.logger.log(
      `Enfileirado SEND_TEMPLATE (${job.id}) [${payload.template}] para ${JSON.stringify(payload.to)}`,
    );
    return job.id;
  }
}
