import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import { AppointmentsQueueService } from './appointments-queue.service';
import { AVAILABLE_APPOINTMENTS_TOKEN } from './appointments.constants';
import { ExecutableAppointment } from './executable-appointment.base';
import { AppointmentId, IAppointment } from 'src/Shared/interfaces/IAppointment';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentSettingsService } from './services/appointment-settings.service';
import { Recurrence } from 'src/enum/recurrence.enum';
import { Role } from 'src/enum/role.enum';

const SYSTEM_CLIENT_ID = 0;

@Injectable()
export class AppointmentsService {
  constructor(
    @Inject(AVAILABLE_APPOINTMENTS_TOKEN)
    private readonly appointments: ExecutableAppointment[],
    private readonly queueService: AppointmentsQueueService,
    private readonly authContext: AuthContextService,
    private readonly settingsService: AppointmentSettingsService,
  ) {}

  async listAppointments(): Promise<{ appointments: IAppointment[] }> {
    const clientId = this.authContext.getClientId();
    const isSuperAdmin = this.authContext.getRole() === Role.SUPER_ADMIN;

    const regularSettings = await this.settingsService.findAllByClient(clientId);
    const systemSettings = isSuperAdmin
      ? await this.settingsService.findAllByClient(SYSTEM_CLIENT_ID)
      : null;

    const items = await Promise.all(
      this.appointments.filter((a) => isSuperAdmin || !a.isInternal).map(async (appointment) => {
        const useSystemSettings = appointment.isInternal && isSuperAdmin;
        const stored = useSystemSettings
          ? systemSettings!.get(appointment.type)
          : regularSettings.get(appointment.type);

        const config = stored?.config ?? appointment.config;
        const recurrence = stored?.recurrence ?? appointment.recurrence;
        const timezone = stored?.timezone ?? appointment.timezone ?? null;

        const scheduledClientId = useSystemSettings ? SYSTEM_CLIENT_ID : clientId;
        const isScheduled = await this.queueService.isScheduled(appointment, scheduledClientId);
        if (isScheduled) {
          this.queueService.remember(appointment, scheduledClientId, { config, recurrence, timezone });
        }
        const isActive = stored?.isActive ?? isScheduled;

        return this.serialize(appointment, { isActive, config, recurrence, timezone });
      }),
    );

    return { appointments: items };
  }

  async updateStatus(id: AppointmentId, dto: UpdateAppointmentDto): Promise<IAppointment> {
    const appointment = this.findAppointment(id);
    const isSuperAdmin = this.authContext.getRole() === Role.SUPER_ADMIN;

    if (appointment.isInternal && isSuperAdmin) {
      return this.updateInternalAppointment(appointment, dto);
    }

    const clientId = this.authContext.getClientId();
    const stored = await this.settingsService.findOne(clientId, appointment.type);
    const recurrence = dto.recurrence ?? stored?.recurrence ?? appointment.recurrence;
    const timezone = dto.timezone ?? stored?.timezone ?? appointment.timezone ?? null;
    const config = (dto.config as unknown) ?? stored?.config ?? appointment.config;

    if (dto.isActive) {
      await this.queueService.schedule(appointment, clientId, { config, recurrence, timezone });
    } else {
      await this.queueService.unschedule(appointment, clientId);
    }

    await this.settingsService.upsert({
      clientId,
      appointmentType: appointment.type,
      isActive: dto.isActive,
      recurrence,
      timezone,
      config: config ?? null,
    });

    return this.serialize(appointment, {
      isActive: dto.isActive,
      config: dto.isActive ? config : stored?.config ?? appointment.config,
      recurrence,
      timezone,
    });
  }

  private async updateInternalAppointment(
    appointment: ExecutableAppointment,
    dto: UpdateAppointmentDto,
  ): Promise<IAppointment> {
    const systemStored = await this.settingsService.findOne(SYSTEM_CLIENT_ID, appointment.type);
    const recurrence = dto.recurrence ?? systemStored?.recurrence ?? appointment.recurrence;
    const timezone = dto.timezone ?? systemStored?.timezone ?? appointment.timezone ?? null;
    const config = (dto.config as unknown) ?? systemStored?.config ?? appointment.config;

    const clientIds = await this.settingsService.getAllActiveClientIds();

    for (const clientId of clientIds) {
      if (dto.isActive) {
        await this.queueService.schedule(appointment, clientId, { config, recurrence, timezone });
      } else {
        await this.queueService.unschedule(appointment, clientId);
      }
    }

    await this.settingsService.upsert({
      clientId: SYSTEM_CLIENT_ID,
      appointmentType: appointment.type,
      isActive: dto.isActive,
      recurrence,
      timezone,
      config: config ?? null,
    });

    await this.settingsService.upsertBulk(clientIds, {
      appointmentType: appointment.type,
      isActive: dto.isActive,
      recurrence,
      timezone,
      config: config ?? null,
    });

    return this.serialize(appointment, {
      isActive: dto.isActive,
      config: dto.isActive ? config : systemStored?.config ?? appointment.config,
      recurrence,
      timezone,
    });
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
    overrides: { isActive: boolean; config: unknown; recurrence: Recurrence; timezone: string | null },
  ): IAppointment & { config: unknown } {
    return {
      id: appointment.id,
      name: appointment.name,
      description: appointment.description,
      recurrence: overrides.recurrence,
      isActive: overrides.isActive,
      type: appointment.type,
      config: overrides.config,
      timezone: overrides.timezone,
    };
  }
}
