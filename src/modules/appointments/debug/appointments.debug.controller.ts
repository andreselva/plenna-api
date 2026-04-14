import { Controller, Delete, Get, Inject, NotFoundException, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import { AppointmentsQueueService } from '../appointments-queue.service';
import { APPOINTMENTS_QUEUE_TOKEN, AVAILABLE_APPOINTMENTS_TOKEN } from '../appointments.constants';
import { ExecutableAppointment } from '../executable-appointment.base';
import { Queue } from '../queue.provider';
import { AppointmentsEnum } from 'src/enum/appointments.enum';

@Controller('appointments/debug')
export class AppointmentsDebugController {
  constructor(
    @Inject(APPOINTMENTS_QUEUE_TOKEN)
    private readonly queue: Queue,
    @Inject(AVAILABLE_APPOINTMENTS_TOKEN)
    private readonly appointments: ExecutableAppointment[],
    private readonly authContext: AuthContextService,
    private readonly queueService: AppointmentsQueueService,
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

  @Post('trigger/:type')
  async trigger(@Param('type') type: AppointmentsEnum) {
    const appointment = this.appointments.find((a) => a.type === type);
    if (!appointment) {
      throw new NotFoundException(`Agendamento "${type}" não encontrado.`);
    }

    const clientId = this.authContext.getClientId();
    await appointment.execute({ clientId, appointmentId: appointment.id, config: null });
    return { triggered: type, clientId };
  }

  @Delete('unschedule/:type/:clientId')
  async unschedule(
    @Param('type') type: AppointmentsEnum,
    @Param('clientId', ParseIntPipe) clientId: number,
  ) {
    const appointment = this.appointments.find((a) => a.type === type);
    if (!appointment) {
      throw new NotFoundException(`Agendamento "${type}" não encontrado.`);
    }

    await this.queueService.unschedule(appointment, clientId);
    return { unscheduled: type, clientId };
  }

  @Delete('unschedule-all/:type')
  async unscheduleAll(@Param('type') type: AppointmentsEnum) {
    const appointment = this.appointments.find((a) => a.type === type);
    if (!appointment) {
      throw new NotFoundException(`Agendamento "${type}" não encontrado.`);
    }

    const schedulers = await this.queue.getRepeatableJobs?.() ?? [];
    const prefix = `${type}:`;
    const targets = schedulers.filter((s: any) => (s.id ?? s.key ?? '').includes(prefix));

    for (const s of targets) {
      const rawClientId = Number((s.id ?? s.key ?? '').replace(prefix, ''));
      if (!isNaN(rawClientId)) {
        await this.queueService.unschedule(appointment, rawClientId);
      }
    }

    return { unscheduled: type, count: targets.length };
  }
}
