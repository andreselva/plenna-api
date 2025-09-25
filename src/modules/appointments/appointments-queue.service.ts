import { Inject, Injectable, Logger } from '@nestjs/common';
import { Recurrence } from 'src/enum/recurrence.enum';
import { APPOINTMENTS_QUEUE_TOKEN } from './appointments.constants';
import { ExecutableAppointment } from './executable-appointment.base';
import { AppointmentJobData } from './types/appointment-job-data.type';
import type { Queue } from './queue.provider';

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
      jobId,
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

    const schedulers = await this.queue.getJobSchedulers();

    // Procura por chave nova (igual ao jobId saneado) e também por legado (termina com ":type:clientId")
    const legacy = this.legacySuffix(appointment.type, clientId);
    const found = schedulers.find(
      (r: any) =>
        r.key === jobId ||
        r.id === jobId ||
        (typeof r.key === 'string' && r.key.endsWith(legacy)),
    );

    if (found) {
      this.scheduled.set(jobId, {
        appointmentId: appointment.id,
        appointmentType: appointment.type,
        clientId,
        jobId,
        config: null,
        recurrence: null,
        timezone: null,
        repeatJobKey: (found as any).key ?? null,
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

    const schedulers = await this.queue.getJobSchedulers();

    const scheduled = this.scheduled.get(jobId);
    const repeatKeyFromMemory = scheduled?.repeatJobKey ?? null;

    const match = schedulers.find(
      (item: any) =>
        (repeatKeyFromMemory && item.key === repeatKeyFromMemory) ||
        item.key === jobId ||
        item.id === jobId ||
        (typeof item.key === 'string' && item.key.endsWith(legacy)),
    );

    if (!this.scheduled.has(jobId) && !match) {
      return;
    }

    const queueWithKeyRemoval = this.queue as Queue<AppointmentJobData> & {
      removeJobScheduler?: (key: string) => Promise<void>;
      remove?: (id: string) => Promise<void | number>;
    };

    this.logger.log(
      `Removendo agendamentos anteriores de ${appointment.type} do cliente ${clientId}`,
    );

    if (match && queueWithKeyRemoval.removeJobScheduler) {
      await queueWithKeyRemoval.removeJobScheduler((match as any).key);
    } else if (match) {
      await (this.queue as any).removeJobScheduler((match as any).key ?? jobId);
    }

    if (queueWithKeyRemoval.remove) {
      try {
        await queueWithKeyRemoval.remove(jobId);
      } catch (error) {
        this.logger.debug(
          `Não foi possível remover job ${jobId} diretamente: ${(error as Error).message}`,
        );
      }
    }

    this.scheduled.delete(jobId);
  }
}
