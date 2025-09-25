import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Worker } from 'bullmq';

import { EmailWorkerModule } from './email-worker.module';
import { WorkerAuthContextService } from '../worker-auth-context.service';
import { EmailWorkerService } from './email-worker.service';
import { EMAIL_QUEUE_NAME } from 'src/modules/email/email.constants';
import { SendMailPayload, SendTemplatePayload } from 'src/modules/email/email.types';
import { createRedisConnectionOptions } from '../redis-connection';

type EmailJobData = SendMailPayload | (SendTemplatePayload & { clientId?: number | null });

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(EmailWorkerModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const logger = new Logger('EmailWorker');
  const config = app.get(ConfigService);

  const workerService = app.get(EmailWorkerService);
  const authContext = app.get(WorkerAuthContextService);

  const connection = createRedisConnectionOptions();
  const concurrency = config.get<number>('email.concurrency') ?? 5;

  const worker = new Worker<EmailJobData>(
    EMAIL_QUEUE_NAME,
    async (job) => {
      const payload = (job.data ?? {}) as { clientId?: number | null };
      const clientId = payload.clientId ?? null;

      const ctx = {
        userId: null,
        tenantId: null,
        roles: ['system'],
        clientId,
        user: clientId ? { id: 0, username: 'worker', role: 'system', clientId } : null,
      };

      logger.debug(`Executando ${job.name} (${job.id})`);

      return authContext.runWithContext(ctx, async () => {
        try {
          await workerService.process(job);
        } catch (err) {
          logger.error(
            `[FAIL] ${job.name} -> ${job.id}: ${(err as Error).message}`,
            (err as Error).stack,
          );
          throw err;
        }
      });
    },
    { connection, concurrency },
  );

  worker.on('failed', (job, err) => {
    logger.error(
      `[FAILED EVENT] ${job?.name} -> ${job?.id}: ${(err as Error).message}`,
      (err as Error).stack,
    );
  });

  worker.on('completed', (job) => {
    logger.debug(`[DONE] ${job?.name} -> ${job?.id}`);
  });

  logger.log(`Email worker iniciado (concurrency=${concurrency})`);
}

bootstrap().catch((err) => {
   
  console.error(err);
  process.exit(1);
});
