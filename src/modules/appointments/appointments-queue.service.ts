import { Inject, Injectable, Logger } from '@nestjs/common';
import { Recurrence } from 'src/enum/recurrence.enum';
import { APPOINTMENTS_QUEUE_TOKEN } from './appointments.constants';
import { ExecutableAppointment } from './executable-appointment.base';
import { AppointmentJobData } from './types/appointment-job-data.type';
import type { Queue } from './queue.provider';

type QueueWithSchedulers = Queue<AppointmentJobData> & {
  getJobSchedulers?: () => Promise<any[]>;
  removeJobScheduler?: (key: string) => Promise<void>;
  getRepeatableJobs?: () => Promise<any[]>;
  removeRepeatableByKey?: (key: string) => Promise<void>;
  removeRepeatable?: (name: string, repeat: any, jobId?: string) => Promise<void>;
};

interface SchedulerEntry {
  id: string | null;
  key: string | null;
}

interface ScheduledAppointment<TConfig = unknown> {
  appointmentId: number;
  appointmentType: string;
  clientId: number;
  jobId: string;
  config: TConfig | null;
  recurrence: Recurrence | null;
  timezone: string | null;
  repeatJobKey: string | null;
}

@Injectable()
export class AppointmentsQueueService {
  private readonly logger = new Logger(AppointmentsQueueService.name);

  private readonly scheduled = new Map<string, ScheduledAppointment>();

  constructor(
    @Inject(APPOINTMENTS_QUEUE_TOKEN)
    private readonly queue: Queue<AppointmentJobData>,
  ) {}

  private sanitizeId(id: string): string {
    return id.replace(/:/g, '__');
  }

  private legacySuffix(type: string, clientId: number): string {
    return `:${type}:${clientId}`;
  }

  private schedulerCapableQueue(): QueueWithSchedulers {
    return this.queue as QueueWithSchedulers;
  }

  private async listSchedulers(): Promise<SchedulerEntry[]> {
    const queue = this.schedulerCapableQueue();

    if (typeof queue.getJobSchedulers === 'function') {
      const schedulers = await queue.getJobSchedulers();
      return schedulers.map((item: any) => ({
        id: typeof item?.id === 'string' ? item.id : null,
        key: typeof item?.key === 'string' ? item.key : null,
      }));
    }

    if (typeof queue.getRepeatableJobs === 'function') {
      const repeatables = await queue.getRepeatableJobs();
      return repeatables.map((item: any) => ({
        id: typeof item?.id === 'string' ? item.id : null,
        key: typeof item?.key === 'string' ? item.key : typeof item?.id === 'string' ? item.id : null,
      }));
    }

    return [];
  }

  async schedule<TConfig>(
    appointment: ExecutableAppointment<TConfig>,
    clientId: number,
    options: { config: TConfig | null; recurrence?: Recurrence; timezone?: string | null },
  ): Promise<void> {
    const rawJobId = appointment.buildJobId(clientId);
    const jobId = this.sanitizeId(rawJobId);

    await this.clearFromQueue(appointment, clientId);

    const recurrence = options.recurrence ?? appointment.recurrence;
    const timezone  = options.timezone ?? appointment.timezone ?? null;

    const baseRepeat = appointment.buildRepeatOptions(recurrence, timezone);
    // BullMQ v5 usa “key” para identificar o agendamento; vamos fixar como nosso jobId saneado
    const repeat = { ...baseRepeat, key: jobId } as typeof baseRepeat & { key: string };

    const payload: AppointmentJobData<TConfig> = {
      appointmentId: appointment.id,
      clientId,
      config: options.config,
      recurrence,
      timezone,
    };

    this.logger.log(
      `Agendando ${appointment.type} para o cliente ${clientId} (${JSON.stringify(repeat)})`,
    );

    const job = await this.queue.add(appointment.type, payload, {
      jobId: rawJobId,
      repeat,
      removeOnComplete: true,
    });

    const repeatJobKey = (job as any)?.repeatJobKey ?? null;

    this.scheduled.set(jobId, {
      appointmentId: appointment.id,
      appointmentType: appointment.type,
      clientId,
      jobId,
      config: options.config,
      recurrence,
      timezone,
      repeatJobKey,
    });
  }

  async unschedule<TConfig>(
    appointment: ExecutableAppointment<TConfig>,
    clientId: number,
  ): Promise<void> {
    await this.clearFromQueue(appointment, clientId);
  }

  async isScheduled<TConfig>(
    appointment: ExecutableAppointment<TConfig>,
    clientId: number,
  ): Promise<boolean> {
    const rawJobId = appointment.buildJobId(clientId);
    const jobId = this.sanitizeId(rawJobId);

    if (this.scheduled.has(jobId)) {
      return true;
    }

    const schedulers = await this.listSchedulers();

    // Procura por chave nova (igual ao jobId saneado) e também por legado (termina com ":type:clientId")
    const legacy = this.legacySuffix(appointment.type, clientId);
    const found = schedulers.find((r) => {
      const sanitizedKey = typeof r.key === 'string' ? this.sanitizeId(r.key) : null;
      const sanitizedId = typeof r.id === 'string' ? this.sanitizeId(r.id) : null;
      return (
        r.key === jobId ||
        sanitizedKey === jobId ||
        r.id === jobId ||
        sanitizedId === jobId ||
        (typeof r.key === 'string' && r.key.endsWith(legacy)) ||
        (typeof r.id === 'string' && r.id.endsWith(legacy))
      );
    });

    if (found) {
      this.scheduled.set(jobId, {
        appointmentId: appointment.id,
        appointmentType: appointment.type,
        clientId,
        jobId,
        config: null,
        recurrence: null,
        timezone: null,
        repeatJobKey: found.key ?? null,
      });
    }

    return Boolean(found);
  }

  getConfig<TConfig>(
    appointment: ExecutableAppointment<TConfig>,
    clientId: number,
  ): TConfig | null {
    const rawJobId = appointment.buildJobId(clientId);
    const jobId = this.sanitizeId(rawJobId);
    return (this.scheduled.get(jobId)?.config as TConfig | null) ?? null;
  }

  remember<TConfig>(
    appointment: ExecutableAppointment<TConfig>,
    clientId: number,
    options: { config: TConfig | null; recurrence?: Recurrence; timezone?: string | null },
  ): void {
    const rawJobId = appointment.buildJobId(clientId);
    const jobId = this.sanitizeId(rawJobId);

    const scheduled = this.scheduled.get(jobId);
    if (!scheduled) return;

    scheduled.config = options.config;
    scheduled.recurrence = options.recurrence ?? scheduled.recurrence ?? null;
    scheduled.timezone = options.timezone ?? scheduled.timezone ?? null;
    this.scheduled.set(jobId, scheduled);
  }

  private async clearFromQueue<TConfig>(
    appointment: ExecutableAppointment<TConfig>,
    clientId: number,
  ): Promise<void> {
    const rawJobId = appointment.buildJobId(clientId);
    const jobId = this.sanitizeId(rawJobId);
    const legacy = this.legacySuffix(appointment.type, clientId);

    const schedulers = await this.listSchedulers();

    const scheduled = this.scheduled.get(jobId);
    const repeatKeyFromMemory = scheduled?.repeatJobKey ?? null;

    const match = schedulers.find((item) => {
      const sanitizedKey = typeof item.key === 'string' ? this.sanitizeId(item.key) : null;
      const sanitizedId = typeof item.id === 'string' ? this.sanitizeId(item.id) : null;
      return (
        (repeatKeyFromMemory && item.key === repeatKeyFromMemory) ||
        item.key === jobId ||
        sanitizedKey === jobId ||
        item.id === jobId ||
        sanitizedId === jobId ||
        (typeof item.key === 'string' && item.key.endsWith(legacy)) ||
        (typeof item.id === 'string' && item.id.endsWith(legacy))
      );
    });

    if (!this.scheduled.has(jobId) && !match) {
      return;
    }

    const queueWithKeyRemoval = this.queue as Queue<AppointmentJobData> & {
      removeJobScheduler?: (key: string) => Promise<void>;
      removeRepeatableByKey?: (key: string) => Promise<void>;
      removeRepeatable?: (name: string, repeat: any, jobId?: string) => Promise<void>;
      remove?: (id: string) => Promise<void | number>;
    };

    this.logger.log(
      `Removendo agendamentos anteriores de ${appointment.type} do cliente ${clientId}`,
    );

    const schedulerKey = match?.key ?? match?.id ?? jobId;

    if (match && schedulerKey && queueWithKeyRemoval.removeJobScheduler) {
      await queueWithKeyRemoval.removeJobScheduler(schedulerKey);
    } else if (match && schedulerKey && queueWithKeyRemoval.removeRepeatableByKey) {
      await queueWithKeyRemoval.removeRepeatableByKey(schedulerKey);
    } else if (match && queueWithKeyRemoval.removeRepeatable) {
      const recurrenceForRemoval = scheduled?.recurrence ?? appointment.recurrence;
      const timezoneForRemoval = scheduled?.timezone ?? appointment.timezone ?? null;
      const repeat = appointment.buildRepeatOptions(recurrenceForRemoval, timezoneForRemoval);
      await queueWithKeyRemoval.removeRepeatable(
        appointment.type,
        repeat,
        schedulerKey ?? jobId,
      );
    }

    if (queueWithKeyRemoval.remove) {
      const identifiers = new Set<string>([jobId]);
      if (rawJobId !== jobId) {
        identifiers.add(rawJobId);
      }

      for (const identifier of identifiers) {
        try {
          await queueWithKeyRemoval.remove(identifier);
        } catch (error) {
          this.logger.warn(`Não foi possível remover job ${identifier} diretamente: ${(error as Error).message}`,);
        }
      }
    }

    this.scheduled.delete(jobId);
  }
}
