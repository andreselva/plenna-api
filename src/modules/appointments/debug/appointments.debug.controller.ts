import { Controller, Get, Inject } from '@nestjs/common';
import { APPOINTMENTS_QUEUE_TOKEN } from '../appointments.constants';
import { Queue } from '../queue.provider';

@Controller('appointments/debug')
export class AppointmentsDebugController {
  constructor(
    @Inject(APPOINTMENTS_QUEUE_TOKEN)
    private readonly queue: Queue,
  ) {}

  @Get('repeatables')
  async listRepeatables() {
    const repeatables = await this.queue.getRepeatableJobs?.();
    return repeatables ?? [];
  }

  @Get('waiting')
  async listWaiting() {
    try {
      if (typeof (this.queue as any).getJobs === 'function') {
        return await (this.queue as any).getJobs(['waiting']);
      }
      return [];
    } catch {
      return [];
    }
  }
}
