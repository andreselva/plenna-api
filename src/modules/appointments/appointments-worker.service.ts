import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { APPOINTMENTS_QUEUE_TOKEN, AVAILABLE_APPOINTMENTS_TOKEN } from './appointments.constants';
import { ExecutableAppointment } from './executable-appointment.base';
import { AppointmentJobData } from './types/appointment-job-data.type';
import { createQueueScheduler, createWorker, Queue, QueueScheduler } from './queue.provider';
import { REDIS_CONNECTION } from '../redis/redis.module';
import type { Redis } from 'ioredis';

@Injectable()
export class AppointmentsWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AppointmentsWorkerService.name);
  private worker: any;
  private scheduler: QueueScheduler | null = null;

  constructor(
    @Inject(APPOINTMENTS_QUEUE_TOKEN)
    private readonly queue: Queue<AppointmentJobData>,
    @Inject(AVAILABLE_APPOINTMENTS_TOKEN)
    private readonly appointments: ExecutableAppointment[],
    @Inject(REDIS_CONNECTION)
    private readonly redis: Redis,
  ) {}

  onModuleInit(): void {
    this.scheduler = createQueueScheduler(this.redis);
    if (this.scheduler?.waitUntilReady) {
      this.scheduler
        .waitUntilReady()
        .then(() => this.logger.log('Scheduler de Appointments pronto'))
        .catch((error) =>
          this.logger.error('Falha ao iniciar o scheduler de Appointments', error as Error),
        );
    }

    this.worker = createWorker<AppointmentJobData>(async (job) => {
      const appointment = this.appointments.find((item) => item.type === job.name);
      if (!appointment) {
        this.logger.warn(`Nenhum manipulador encontrado para o agendamento ${job.name}`);
        return;
      }
      this.logger.debug(`Executando job: ${job.name} (${job.id})`);
      await appointment.execute(job.data);
    }, this.redis);

    this.logger.log('Worker de Appointments iniciado');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker?.close) {
      await this.worker.close();
      this.logger.log('Worker de Appointments finalizado');
    }
    if (this.scheduler?.close) {
      await this.scheduler.close();
      this.logger.log('Scheduler de Appointments finalizado');
    }
  }
}
