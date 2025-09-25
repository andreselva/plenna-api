export interface IAppointmentHandler<TConfig = unknown> {
  readonly type: string;

  execute(input: { clientId: number; appointmentId: number; config: TConfig | null }): Promise<void>;

  validateConfig?(config: unknown): asserts config is TConfig;
}
