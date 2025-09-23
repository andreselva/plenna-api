import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { APPOINTMENTS_QUEUE_TOKEN, AVAILABLE_APPOINTMENTS_TOKEN } from './appointments.constants';
import { ExecutableAppointment } from './executable-appointment.base';
import { AppointmentJobData } from './types/appointment-job-data.type';
import { createQueueScheduler, createWorker, Queue, QueueScheduler } from './queue.provider';
import { REDIS_CONNECTION } from '../redis/redis.module';
import type { Redis } from 'ioredis';
import type { Worker } from './queue.provider';

@Injectable()
export class AppointmentsWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AppointmentsWorkerService.name);
  private worker: Worker<AppointmentJobData> | null = null;
  private scheduler: QueueScheduler | null = null;
  private started = false;
  private startPromise: Promise<void> | null = null;

  constructor(
    @Inject(APPOINTMENTS_QUEUE_TOKEN)
    private readonly queue: Queue<AppointmentJobData>,
    @Inject(AVAILABLE_APPOINTMENTS_TOKEN)
    private readonly appointments: ExecutableAppointment[],
    @Inject(REDIS_CONNECTION)
    private readonly redis: Redis,
  ) {}

  onModuleInit(): void {
    void this.ensureInitialized();
  }

  async ensureInitialized(): Promise<void> {
    if (this.started) {
      return;
    }

    if (!this.startPromise) {
      this.startPromise = this.startWorker()
        .catch((error) => {
          this.logger.error('Falha ao iniciar o worker de Appointments', error as Error);
          this.started = false;
          throw error;
        })
        .finally(() => {
          this.startPromise = null;
        });
    }

    await this.startPromise;
  }

  private async startWorker(): Promise<void> {
    if (this.started) {
      return;
    }

    let scheduler: QueueScheduler | null = null;
    let worker: Worker<AppointmentJobData> | null = null;

    try {
      scheduler = createQueueScheduler(this.redis);
      if (scheduler?.waitUntilReady) {
        await scheduler.waitUntilReady();
      }
      this.logger.log('Scheduler de Appointments pronto');
    } catch (error) {
      this.logger.error('Falha ao iniciar o scheduler de Appointments', error as Error);
      throw error;
    }

    try {
      worker = createWorker<AppointmentJobData>(async (job) => {
        const appointment = this.appointments.find((item) => item.type === job.name);
        if (!appointment) {
          this.logger.warn(`Nenhum manipulador encontrado para o agendamento ${job.name}`);
          return;
        }
        this.logger.debug(`Executando job: ${job.name} (${job.id})`);
        await appointment.execute(job.data);
      }, this.redis);
    } catch (error) {
      await scheduler?.close?.().catch(() => undefined);
      this.logger.error('Falha ao criar o worker de Appointments', error as Error);
      throw error;
    }

    if (typeof (worker as any)?.on === 'function') {
      (worker as any).on('error', (err: Error) => {
        this.logger.error('Erro não tratado no worker de Appointments', err);
      });
      (worker as any).on('failed', (job: any, err: Error) => {
        const jobId = job?.id ?? 'desconhecido';
        const jobName = job?.name ?? 'desconhecido';
        this.logger.error(`Job ${jobName} (${jobId}) falhou`, err);
      });
    }

    if (worker?.waitUntilReady) {
      try {
        await worker.waitUntilReady();
        this.logger.log('Worker de Appointments conectado ao Redis');
      } catch (error) {
        await worker.close?.().catch(() => undefined);
        await scheduler?.close?.().catch(() => undefined);
        this.logger.error('Falha ao conectar o worker de Appointments', error as Error);
        throw error;
      }
    }

    this.scheduler = scheduler;
    this.worker = worker;
    this.started = true;
    this.logger.log('Worker de Appointments iniciado');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.worker?.close) {
      await this.worker.close();
      this.logger.log('Worker de Appointments finalizado');
    }
    this.worker = null;
    if (this.scheduler?.close) {
      await this.scheduler.close();
      this.logger.log('Scheduler de Appointments finalizado');
    }
    this.scheduler = null;
    this.started = false;
    this.startPromise = null;
  }
}
