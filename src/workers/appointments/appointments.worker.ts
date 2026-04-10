import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppointmentsWorkerModule } from './appointments-worker.module';
import { APPOINTMENTS_QUEUE_NAME } from 'src/modules/appointments/appointments.constants';
import { AppointmentJobData } from 'src/modules/appointments/types/appointment-job-data.type';
import { WorkerAuthContextService } from '../worker-auth-context.service';
import { AppointmentsWorkerService } from './appointments-worker.service';
import { WorkerFactory } from '../worker.factory';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppointmentsWorkerModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const logger = new Logger('AppointmentsWorker');

  const appointmentsWorker = app.get(AppointmentsWorkerService);
  const authContext = app.get(WorkerAuthContextService);
  const workerFactory = app.get(WorkerFactory);

  const concurrency = Number(process.env.APPOINTMENTS_WORKER_CONCURRENCY ?? 5);

  const worker = workerFactory.create<AppointmentJobData>(
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

      logger.log(
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
    { concurrency },
  );

  worker.on('failed', (job, err) => {
    logger.error(
      `[FAILED EVENT] ${job?.name} -> ${job?.id}: ${err.message}`,
      err.stack,
    );
  });

  worker.on('completed', (job) => {
    logger.log(`[DONE] ${job?.name} -> ${job?.id}`);
  });

  logger.log(`Appointments worker iniciado (concurrency=${concurrency})`);
}

bootstrap().catch((e) => {
  console.error(e);
  process.exit(1);
});