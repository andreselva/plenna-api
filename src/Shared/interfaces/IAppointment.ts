import { Recurrence } from "src/enum/recurrence.enum";

export type AppointmentId = number;

export interface IAppointment<TConfig = unknown> {
  id: AppointmentId;
  name: string;
  description?: string;
  recurrence: Recurrence;
  isActive: boolean;
  isInternal?: boolean;
  type: string;
  config: TConfig | null;
  timezone?: string | null;
}
