import { Recurrence } from 'src/enum/recurrence.enum';

export interface AppointmentJobData<TConfig = unknown> {
  clientId: number;
  appointmentId: number;
  config: TConfig | null;
  recurrence?: Recurrence | null;
  timezone?: string | null;
}
