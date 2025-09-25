import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';

import { WorkerModule } from './worker.module';
import { APPOINTMENTS_QUEUE_NAME } from 'src/modules/appointments/appointments.constants';
import { AppointmentJobData } from 'src/modules/appointments/types/appointment-job-data.type';

// usamos diretamente a implementação do worker (tem runWithContext)
import { WorkerAuthContextService } from './worker-auth-context.service';
import { AppointmentsWorkerService } from './appointments-worker.service';

function parseRedisConnection() {
  const url = process.env.REDIS_URL;
  if (url) {
    const u = new URL(url);
    const useTLS = u.protocol === 'rediss:';
    return {
      host: u.hostname,
      port: Number(u.port || 6379),
      username: u.username || undefined,
      password: u.password || undefined,
      tls: useTLS ? {} : undefined,
    };
  }
  return {
    host: process.env.REDIS_HOST || 'redis',
    port: +(process.env.REDIS_PORT || 6379),
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  };
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const logger = new Logger('AppointmentsWorker');

  // Tipamos o serviço com a assinatura mínima que vamos usar (tem .process)
  type AppointmentsWorkerWithProcess = {
    process: (job: Job<AppointmentJobData>) => Promise<void> | void;
  };

  const appointmentsWorker = app.get(AppointmentsWorkerService) as unknown as AppointmentsWorkerWithProcess;

  // Pega a nossa implementação que disponibiliza runWithContext
  const authContext = app.get(WorkerAuthContextService);

  const connection = parseRedisConnection();

  const worker = new Worker<AppointmentJobData>(
    APPOINTMENTS_QUEUE_NAME,
    async (job) => {
      const ctx = {
        userId: null,
        tenantId: null,
        roles: ['system'],
        clientId: job.data.clientId ?? null,
        user: job.data.clientId
          ? { id: 0, username: 'worker', role: 'system', clientId: job.data.clientId }
          : null,
      };

      logger.debug(
        `Executando ${job.name} (${job.id})${job.repeatJobKey ? ` (repeat:${job.repeatJobKey})` : ''}`,
      );

      return authContext.runWithContext(ctx, async () => {
        try {
          await appointmentsWorker.process(job);
        } catch (err) {
          logger.error(
            `[FAIL] ${job.name} -> ${job.id}${job.repeatJobKey ? `: ${job.repeatJobKey}` : ''}: ${(err as Error).message}`,
            (err as Error).stack,
          );
          throw err;
        }
      });
    },
    { connection, concurrency: +(process.env.APPOINTMENTS_WORKER_CONCURRENCY || 5) },
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

  logger.log(
    `Appointments worker iniciado (concurrency=${+(process.env.APPOINTMENTS_WORKER_CONCURRENCY || 5)})`,
  );
}

bootstrap().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
