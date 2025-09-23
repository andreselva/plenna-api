import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { APPOINTMENTS_QUEUE_TOKEN, AVAILABLE_APPOINTMENTS_TOKEN } from '../appointments.constants';
import { Queue } from '../queue.provider';
import { ExecutableAppointment } from '../executable-appointment.base';

@Injectable()
export class AppointmentsBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppointmentsBootstrapService.name);

  constructor(
    @Inject(APPOINTMENTS_QUEUE_TOKEN)
    private readonly queue: Queue,
    @Inject(AVAILABLE_APPOINTMENTS_TOKEN)
    private readonly appointments: ExecutableAppointment[],
  ) {}

  async onApplicationBootstrap() {
    try {
      const repeatables = await this.queue.getRepeatableJobs?.();
      if (!repeatables || !Array.isArray(repeatables)) {
        this.logger.warn('Queue não fornece repeatables; pulando sincronização.');
        return;
      }

      this.logger.log(`Repeatables atualmente: ${repeatables.length}`);
      for (const r of repeatables) {
        this.logger.debug(`- ${r.name} | id = ${r.id} | next = ${r.next ?? 'n/a'}`);
      }
    } catch (e) {
      this.logger.error('Falha ao ler repeatables na inicialização', e as Error);
    }
  }
}
