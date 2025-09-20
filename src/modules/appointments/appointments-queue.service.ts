import { Inject, Injectable, Logger } from '@nestjs/common';
import { Recurrence } from 'src/enum/recurrence.enum';
import { APPOINTMENTS_QUEUE_TOKEN } from './appointments.constants';
import { ExecutableAppointment } from './executable-appointment.base';
import { AppointmentJobData } from './types/appointment-job-data.type';
import { Queue } from './queue.provider';

interface ScheduledAppointment<TConfig = unknown> {
  appointmentId: number;
  appointmentType: string;
  clientId: number;
  jobId: string;
  config: TConfig | null;
  recurrence: Recurrence | null;
  timezone: string | null;
}

@Injectable()
export class AppointmentsQueueService {
  private readonly logger = new Logger(AppointmentsQueueService.name);

  private readonly scheduled = new Map<string, ScheduledAppointment>();

  constructor(
    @Inject(APPOINTMENTS_QUEUE_TOKEN)
    private readonly queue: Queue<AppointmentJobData>,
  ) {}

  async schedule<TConfig>(
    appointment: ExecutableAppointment<TConfig>,
    clientId: number,
    options: { config: TConfig | null; recurrence?: Recurrence; timezone?: string | null },
  ): Promise<void> {
    const jobId = appointment.buildJobId(clientId);
    const recurrence = options.recurrence ?? appointment.recurrence;
    const timezone = options.timezone ?? appointment.timezone ?? null;
    const repeat = appointment.buildRepeatOptions(recurrence, timezone);
    const payload: AppointmentJobData<TConfig> = {
      appointmentId: appointment.id,
      clientId,
      config: options.config,
      recurrence,
      timezone,
    };

    this.logger.log(`Agendando ${appointment.type} para o cliente ${clientId} (${JSON.stringify(repeat)})`);
    await this.queue.add(appointment.type, payload, {
      jobId,
      repeat,
      removeOnComplete: true,
    });

    this.scheduled.set(jobId, {
      appointmentId: appointment.id,
      appointmentType: appointment.type,
      clientId,
      jobId,
      config: options.config,
      recurrence,
      timezone,
    });
  }

  async unschedule<TConfig>(appointment: ExecutableAppointment<TConfig>, clientId: number): Promise<void> {
    const jobId = appointment.buildJobId(clientId);
    const scheduled = this.scheduled.get(jobId);
    const recurrence = scheduled?.recurrence ?? appointment.recurrence;
    const timezone = scheduled?.timezone ?? appointment.timezone ?? null;
    const repeat = appointment.buildRepeatOptions(recurrence, timezone);
    this.logger.log(`Removendo agendamento ${appointment.type} do cliente ${clientId}`);
    await this.queue.removeRepeatable(appointment.type, repeat, jobId);
    this.scheduled.delete(jobId);
  }

  async isScheduled<TConfig>(appointment: ExecutableAppointment<TConfig>, clientId: number): Promise<boolean> {
    const jobId = appointment.buildJobId(clientId);
    if (this.scheduled.has(jobId)) {
      return true;
    }

    const repeatables = await this.queue.getRepeatableJobs();
    const found = repeatables.find((item) => item.id === jobId || item.key === jobId);
    if (found) {
      this.scheduled.set(jobId, {
        appointmentId: appointment.id,
        appointmentType: appointment.type,
        clientId,
        jobId,
        config: null,
        recurrence: null,
        timezone: null,
      });
    }

    return Boolean(found);
  }

  getConfig<TConfig>(appointment: ExecutableAppointment<TConfig>, clientId: number): TConfig | null {
    const jobId = appointment.buildJobId(clientId);
    return (this.scheduled.get(jobId)?.config as TConfig | null) ?? null;
  }

  remember<TConfig>(
    appointment: ExecutableAppointment<TConfig>,
    clientId: number,
    options: { config: TConfig | null; recurrence?: Recurrence; timezone?: string | null },
  ): void {
    const jobId = appointment.buildJobId(clientId);
    const scheduled = this.scheduled.get(jobId);
    if (!scheduled) {
      return;
    }

    scheduled.config = options.config;
    scheduled.recurrence = options.recurrence ?? scheduled.recurrence ?? null;
    scheduled.timezone = options.timezone ?? scheduled.timezone ?? null;
    this.scheduled.set(jobId, scheduled);
  }
}
