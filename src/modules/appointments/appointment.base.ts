import { Recurrence } from 'src/enum/recurrence.enum';
import { IAppointment } from 'src/Shared/interfaces/IAppointment';

export abstract class AppointmentBase<TConfig = unknown> implements IAppointment<TConfig> {
  public isInternal: boolean = false;

  constructor(
    public id: number,
    public name: string,
    public description: string | undefined,
    public recurrence: Recurrence,
    public isActive: boolean,
    public readonly type: string,
    public config: TConfig | null,
    public timezone?: string | null,
  ) {}

  buildJobId(clientId: number) {
    return `${this.type}:${clientId}`;
  }

  buildRepeatOptions(
    recurrenceOverride?: Recurrence,
    timezoneOverride?: string | null,
  ): { pattern?: string; every?: number; tz?: string } {
    const recurrence = recurrenceOverride ?? this.recurrence;
    const tz = timezoneOverride ?? this.timezone ?? 'America/Sao_Paulo';
    switch (recurrence) {
      case Recurrence.EVERY_15_MIN: return { every: 15 * 60 * 1000 };//Da pra usar esse recurrence para testar, só definir para every: 5_000
      case Recurrence.HOURLY:       return { pattern: '0 * * * *', tz };
      case Recurrence.DAILY_03:     return { pattern: '0 3 * * *', tz };
      case Recurrence.DAILY_08:     return { pattern: '0 8 * * *', tz };
      case Recurrence.WEEKDAYS_08:  return { pattern: '0 8 * * 1-5', tz };
      case Recurrence.WEEKLY_MON_09:return { pattern: '0 9 * * 1', tz };
      default:                      return { pattern: '0 8 * * *', tz };
    }
  }
}
