import { Controller, Get, Inject, NotFoundException, Param, Post } from '@nestjs/common';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import { APPOINTMENTS_QUEUE_TOKEN, AVAILABLE_APPOINTMENTS_TOKEN } from '../appointments.constants';
import { ExecutableAppointment } from '../executable-appointment.base';
import { Queue } from '../queue.provider';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('appointments/debug')
export class AppointmentsDebugController {
  constructor(
    @Inject(APPOINTMENTS_QUEUE_TOKEN)
    private readonly queue: Queue,
    @Inject(AVAILABLE_APPOINTMENTS_TOKEN)
    private readonly appointments: ExecutableAppointment[],
    private readonly authContext: AuthContextService,
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

  @Public()
  @Post('trigger/:type')
  async trigger(@Param('type') type: string) {
    const appointment = this.appointments.find((a) => a.type === type);
    if (!appointment) {
      throw new NotFoundException(`Agendamento "${type}" não encontrado.`);
    }

    const clientId = this.authContext.getClientId();
    await appointment.execute({ clientId, appointmentId: appointment.id, config: null });
    return { triggered: type, clientId };
  }
}
