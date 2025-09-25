import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueueEvents } from 'bullmq';
import { EMAIL_EVENTS_TOKEN } from '../email.constants';

@Injectable()
export class EmailQueueHealth {
  private readonly logger = new Logger(EmailQueueHealth.name);

  constructor(@Inject(EMAIL_EVENTS_TOKEN) private readonly events: QueueEvents) {
    this.events.on('waiting', ({ jobId }) => this.logger.debug(`Job aguardando: ${jobId}`));
    this.events.on('active', ({ jobId }) => this.logger.debug(`Job ativo: ${jobId}`));
    this.events.on('stalled', ({ jobId }) => this.logger.warn(`Job travado: ${jobId}`));
    this.events.on('failed', ({ jobId, failedReason }) =>
      this.logger.error(`Job falhou: ${jobId} - ${failedReason}`),
    );
    this.events.on('completed', ({ jobId }) => this.logger.debug(`Job concluído: ${jobId}`));
  }
}
