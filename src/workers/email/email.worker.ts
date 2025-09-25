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
  const lockDuration = config.get<number>('email.lockDurationMs') ?? 120000;
  const rawLockRenewTime = config.get<number>('email.lockRenewTimeMs') ?? 30000;
  const lockRenewTime = Math.max(5000, Math.min(rawLockRenewTime, Math.floor(lockDuration / 2)));

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

      logger.log(`Executando ${job.name} (${job.id})`);

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
    { connection, concurrency, lockDuration, lockRenewTime },
  );

  worker.on('failed', (job, err) => {
    logger.error(
      `[FAILED EVENT] ${job?.name} -> ${job?.id}: ${(err).message}`,
      (err).stack,
    );
  });

  worker.on('completed', async (job) => {
    if (!job) {
      return;
    }

    logger.log(`[DONE] ${job.name} -> ${job.id}`);

    try {
      await job.remove();
      logger.log(`Job removido do Redis: ${job.id}`);
    } catch (err) {
      logger.warn(
        `Falha ao remover o job ${job.id} do Redis: ${(err as Error).message}`,
      );
    }
  });

  logger.log(
    `Email worker iniciado (concurrency=${concurrency}, lockDuration=${lockDuration}ms, lockRenewTime=${lockRenewTime}ms)`,
  );
}

bootstrap().catch((err) => {
   
  console.error(err);
  process.exit(1);
});
