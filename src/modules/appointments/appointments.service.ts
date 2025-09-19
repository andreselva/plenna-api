import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AppointmentBase } from './appointment.base';
import { AppointmentExecutionContext } from './interfaces/appointment-execution-context.interface';
import { AppointmentsScheduler } from './services/appointments-scheduler.service';
import { IAppointment, AppointmentId } from 'src/Shared/interfaces/IAppointment';

export const APPOINTMENTS_TOKEN = 'APPOINTMENTS_TOKEN';

export interface UpdateAppointmentPayload<TConfig = unknown> {
  id: AppointmentId;
  isActive?: boolean;
  config?: TConfig | null;
}

interface AppointmentState<TConfig = unknown> {
  isActive: boolean;
  config: TConfig | null;
  lastExecutionAt: Date | null;
}

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);
  private readonly appointmentMap = new Map<AppointmentId, AppointmentBase>();
  private readonly clientStates = new Map<number, Map<AppointmentId, AppointmentState>>();

  constructor(
    @Inject(APPOINTMENTS_TOKEN) private readonly appointments: AppointmentBase[],
    private readonly scheduler: AppointmentsScheduler,
  ) {
    this.appointments.forEach((appointment) => {
      this.appointmentMap.set(appointment.id, appointment);
    });
  }

  async getAppointments(clientId: number): Promise<IAppointment[]> {
    return this.appointments.map((appointment) => {
      const state = this.ensureState(clientId, appointment);
      return this.toAppointmentDto(appointment, state);
    });
  }

  async updateAppointment<TConfig = unknown>(
    clientId: number,
    payload: UpdateAppointmentPayload<TConfig>,
  ): Promise<IAppointment<TConfig>> {
    const appointment = this.appointmentMap.get(payload.id) as AppointmentBase<TConfig> | undefined;
    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado.');
    }

    const state = this.ensureState(clientId, appointment);

    if (payload.config !== undefined) {
      state.config = payload.config ?? null;
    }

    if (typeof payload.isActive === 'boolean') {
      if (payload.isActive && !state.isActive) {
        state.isActive = true;
        this.scheduleAppointment(appointment, clientId, state);
      } else if (!payload.isActive && state.isActive) {
        state.isActive = false;
        this.scheduler.cancel(appointment, clientId);
      }
    }

    return this.toAppointmentDto(appointment, state);
  }

  private ensureState<TConfig>(
    clientId: number,
    appointment: AppointmentBase<TConfig>,
  ): AppointmentState<TConfig> {
    let clientState = this.clientStates.get(clientId);
    if (!clientState) {
      clientState = new Map<AppointmentId, AppointmentState>();
      this.clientStates.set(clientId, clientState);
    }

    let state = clientState.get(appointment.id) as AppointmentState<TConfig> | undefined;
    if (!state) {
      state = {
        isActive: appointment.isActive,
        config: appointment.config ?? null,
        lastExecutionAt: null,
      };
      clientState.set(appointment.id, state);

      if (state.isActive) {
        this.scheduleAppointment(appointment, clientId, state);
      }
    }

    return state;
  }

  private scheduleAppointment<TConfig>(
    appointment: AppointmentBase<TConfig>,
    clientId: number,
    state: AppointmentState<TConfig>,
  ) {
    if (!state.isActive) {
      this.scheduler.cancel(appointment, clientId);
      return;
    }

    this.scheduler.schedule(appointment, clientId, async () => {
      const context: AppointmentExecutionContext<TConfig> = {
        clientId,
        config: state.config,
        lastExecutionAt: state.lastExecutionAt,
      };

      try {
        await appointment.execute(context);
        state.lastExecutionAt = new Date();
      } catch (error) {
        this.logger.error(
          `Erro ao executar o agendamento ${appointment.type} para o cliente ${clientId}.`,
          error instanceof Error ? error.stack : undefined,
        );
      }

      return state.isActive;
    });
  }

  private toAppointmentDto<TConfig>(
    appointment: AppointmentBase<TConfig>,
    state: AppointmentState<TConfig>,
  ): IAppointment<TConfig> {
    return {
      id: appointment.id,
      name: appointment.name,
      description: appointment.description,
      recurrence: appointment.recurrence,
      isActive: state.isActive,
      type: appointment.type,
      config: state.config,
      timezone: appointment.timezone,
    };
  }
}
