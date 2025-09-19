import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import { APPOINTMENTS_QUEUE_TOKEN } from './appointments.constants';
import { ExecutableAppointment } from './executable-appointment.base';
import { AppointmentJobData } from './types/appointment-job-data.type';
import { AVAILABLE_APPOINTMENTS_TOKEN } from './appointments.constants';

@Injectable()
export class AppointmentsWorkerService implements OnModuleDestroy {
  private readonly logger = new Logger(AppointmentsWorkerService.name);

  private readonly worker: Worker<AppointmentJobData>;

  constructor(
    @Inject(APPOINTMENTS_QUEUE_TOKEN)
    private readonly queue: Queue<AppointmentJobData>,
    @Inject(AVAILABLE_APPOINTMENTS_TOKEN)
    private readonly appointments: ExecutableAppointment[],
  ) {
    this.worker = new Worker<AppointmentJobData>(this.queue.name, async (job) => {
      const appointment = this.appointments.find((item) => item.type === job.name);
      if (!appointment) {
        this.logger.warn(`Nenhum manipulador encontrado para o agendamento ${job.name}`);
        return;
      }

      await appointment.execute(job.data);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker.close();
  }
}
