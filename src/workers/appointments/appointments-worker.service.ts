import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { AVAILABLE_APPOINTMENTS_TOKEN } from 'src/modules/appointments/appointments.constants';
import { ExecutableAppointment } from 'src/modules/appointments/executable-appointment.base';
import { AppointmentJobData } from 'src/modules/appointments/types/appointment-job-data.type';

@Injectable()
export class AppointmentsWorkerService {
  private readonly logger = new Logger(AppointmentsWorkerService.name);

  constructor(
    @Inject(AVAILABLE_APPOINTMENTS_TOKEN)
    private readonly appointments: ExecutableAppointment[],
  ) {}

  async process(job: Job<AppointmentJobData>): Promise<void> {
    const handler = this.appointments.find((appointment) => appointment.type === job.name);

    if (!handler) {
      this.logger.warn(`Nenhum handler encontrado para job ${job.name} (${job.id})`);
      return;
    }

    this.logger.log(`Executando job ${job.name} (${job.id})`);
    await handler.execute(job.data as AppointmentJobData);
  }
}
