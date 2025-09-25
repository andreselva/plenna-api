import { AppointmentBase } from './appointment.base';
import { AppointmentJobData } from './types/appointment-job-data.type';

export abstract class ExecutableAppointment<TConfig = unknown> extends AppointmentBase<TConfig> {
  abstract execute(data: AppointmentJobData<TConfig>): Promise<void>;
}
