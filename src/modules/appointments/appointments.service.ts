import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import { AppointmentsQueueService } from './appointments-queue.service';
import { AVAILABLE_APPOINTMENTS_TOKEN } from './appointments.constants';
import { ExecutableAppointment } from './executable-appointment.base';
import { AppointmentId, IAppointment } from 'src/Shared/interfaces/IAppointment';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @Inject(AVAILABLE_APPOINTMENTS_TOKEN)
    private readonly appointments: ExecutableAppointment[],
    private readonly queueService: AppointmentsQueueService,
    private readonly authContext: AuthContextService,
  ) {}

  async listAppointments(): Promise<{ appointments: IAppointment[] }> {
    const clientId = this.authContext.getClientId();
    const items = await Promise.all(
      this.appointments.map(async (appointment) => {
        const isActive = await this.queueService.isScheduled(appointment, clientId);
        return this.serialize(appointment, isActive, this.queueService.getConfig(appointment, clientId));
      }),
    );

    return { appointments: items };
  }

  async updateStatus(id: AppointmentId, dto: UpdateAppointmentDto): Promise<IAppointment> {
    const appointment = this.findAppointment(id);
    const clientId = this.authContext.getClientId();

    if (dto.isActive) {
      await this.queueService.schedule(appointment, clientId, dto.config ?? appointment.config);
    } else {
      await this.queueService.unschedule(appointment, clientId);
    }

    const isActive = dto.isActive;
    const config = dto.isActive ? dto.config ?? appointment.config : null;

    return this.serialize(appointment, isActive, config);
  }

  private findAppointment(id: AppointmentId): ExecutableAppointment {
    const appointment = this.appointments.find((item) => item.id === id);
    if (!appointment) {
      throw new NotFoundException(`Agendamento ${id} não encontrado.`);
    }
    return appointment;
  }

  private serialize(
    appointment: ExecutableAppointment,
    isActive: boolean,
    config: unknown,
  ): IAppointment & { config: unknown } {
    return {
      id: appointment.id,
      name: appointment.name,
      description: appointment.description,
      recurrence: appointment.recurrence,
      isActive,
      type: appointment.type,
      config,
      timezone: appointment.timezone ?? null,
    };
  }
}
