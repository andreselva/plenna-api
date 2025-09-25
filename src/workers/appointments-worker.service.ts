import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Worker } from 'bullmq';
import type { Redis } from 'ioredis';

import { REDIS_CONNECTION } from 'src/modules/redis/redis.module';
import { APPOINTMENTS_QUEUE_NAME, AVAILABLE_APPOINTMENTS_TOKEN } from 'src/modules/appointments/appointments.constants';
import { ExecutableAppointment } from 'src/modules/appointments/executable-appointment.base';
import { AppointmentJobData } from 'src/modules/appointments/types/appointment-job-data.type';

@Injectable()
export class AppointmentsWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AppointmentsWorkerService.name);
  private worker!: Worker;

  constructor(
    @Inject(AVAILABLE_APPOINTMENTS_TOKEN)
    private readonly appointments: ExecutableAppointment[],
    @Inject(REDIS_CONNECTION)
    private readonly redis: Redis,
  ) {}

  async onModuleInit() {
    const concurrency = Number(process.env.APPOINTMENTS_CONCURRENCY ?? 5);

    this.worker = new Worker<AppointmentJobData>(
      APPOINTMENTS_QUEUE_NAME,
      async (job) => {
        const handler = this.appointments.find(a => a.type === job.name);
        if (!handler) {
          this.logger.warn(`Nenhum handler encontrado para job ${job.name} (${job.id})`);
          return;
        }

        this.logger.debug(`Executando job ${job.name} (${job.id})`);
        await handler.execute(job.data);
      },
      { concurrency, connection: this.redis as any },
    );

    this.worker.on('completed', (job) => this.logger.log(`[OK] ${job.name} -> ${job.id}`));
    this.worker.on('failed', (job, err) =>
      this.logger.error(`[FAIL] ${job?.name} -> ${job?.id}: ${err?.message}`, err?.stack),
    );

    this.logger.log(`Appointments worker iniciado (queue=${APPOINTMENTS_QUEUE_NAME}, concurrency=${concurrency})`);
  }

  async onModuleDestroy() {
    if (this.worker) await this.worker.close();
  }
}
