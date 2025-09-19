import { Inject, Injectable, Logger } from '@nestjs/common';
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
    config: TConfig | null,
  ): Promise<void> {
    const jobId = appointment.buildJobId(clientId);
    const repeat = appointment.buildRepeatOptions();
    const payload: AppointmentJobData<TConfig> = {
      appointmentId: appointment.id,
      clientId,
      config,
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
      config,
    });
  }

  async unschedule<TConfig>(appointment: ExecutableAppointment<TConfig>, clientId: number): Promise<void> {
    const jobId = appointment.buildJobId(clientId);
    const repeat = appointment.buildRepeatOptions();
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
      });
    }

    return Boolean(found);
  }

  getConfig<TConfig>(appointment: ExecutableAppointment<TConfig>, clientId: number): TConfig | null {
    const jobId = appointment.buildJobId(clientId);
    return (this.scheduled.get(jobId)?.config as TConfig | null) ?? null;
  }
}
