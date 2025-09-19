export interface AppointmentJobData<TConfig = unknown> {
  clientId: number;
  appointmentId: number;
  config: TConfig | null;
}
