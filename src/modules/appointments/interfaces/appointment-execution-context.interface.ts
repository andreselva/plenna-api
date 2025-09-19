export interface AppointmentExecutionContext<TConfig = unknown> {
  clientId: number;
  config: TConfig | null;
  lastExecutionAt?: Date | null;
}
