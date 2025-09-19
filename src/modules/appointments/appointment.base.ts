import { DateTime } from "luxon";
import { Recurrence } from "src/enum/recurrence.enum";
import { IAppointment } from "src/Shared/interfaces/IAppointment";
import { AppointmentExecutionContext } from "./interfaces/appointment-execution-context.interface";

export abstract class AppointmentBase<TConfig = unknown> implements IAppointment<TConfig> {
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

  buildRepeatOptions(): { pattern?: string; every?: number; tz?: string } {
    const tz = this.timezone || 'America/Sao_Paulo';
    switch (this.recurrence) {
      case Recurrence.EVERY_15_MIN: return { every: 15 * 60 * 1000 };
      case Recurrence.HOURLY:       return { pattern: '0 * * * *', tz };
      case Recurrence.DAILY_08:     return { pattern: '0 8 * * *', tz };
      case Recurrence.WEEKDAYS_08:  return { pattern: '0 8 * * 1-5', tz };
      case Recurrence.WEEKLY_MON_09:return { pattern: '0 9 * * 1', tz };
      default:                      return { pattern: '0 8 * * *', tz };
    }
  }

  abstract execute(context: AppointmentExecutionContext<TConfig>): Promise<void>;

  calculateNextExecution(from?: Date): Date {
    const tz = this.timezone || 'America/Sao_Paulo';
    const base = from
      ? DateTime.fromJSDate(from).setZone(tz)
      : DateTime.now().setZone(tz);

    let next: DateTime;

    switch (this.recurrence) {
      case Recurrence.EVERY_15_MIN:
        next = this.calculateNextEvery15Minutes(base);
        break;
      case Recurrence.HOURLY:
        next = base.plus({ hours: 1 }).set({ minute: 0, second: 0, millisecond: 0 });
        break;
      case Recurrence.DAILY_08:
        next = this.setTimeOrNextDay(base, 8);
        break;
      case Recurrence.WEEKDAYS_08:
        next = this.nextWeekday(base, 8);
        break;
      case Recurrence.WEEKLY_MON_09:
        next = this.nextSpecificWeekday(base, 1, 9);
        break;
      default:
        next = this.setTimeOrNextDay(base, 8);
        break;
    }

    return next.toJSDate();
  }

  private calculateNextEvery15Minutes(base: DateTime): DateTime {
    const minutesRemainder = base.minute % 15;
    const minutesToAdd = minutesRemainder === 0 && base.second === 0 && base.millisecond === 0
      ? 15
      : 15 - minutesRemainder;

    return base
      .plus({ minutes: minutesToAdd })
      .set({ second: 0, millisecond: 0 });
  }

  private setTimeOrNextDay(base: DateTime, hour: number): DateTime {
    let next = base.set({ hour, minute: 0, second: 0, millisecond: 0 });
    if (next <= base) {
      next = next.plus({ days: 1 }).set({ hour, minute: 0, second: 0, millisecond: 0 });
    }
    return next;
  }

  private nextWeekday(base: DateTime, hour: number): DateTime {
    let next = this.setTimeOrNextDay(base, hour);
    while (next.weekday > 5) {
      next = next.plus({ days: 1 }).set({ hour, minute: 0, second: 0, millisecond: 0 });
    }
    return next;
  }

  private nextSpecificWeekday(base: DateTime, weekday: number, hour: number): DateTime {
    let next = base.set({ hour, minute: 0, second: 0, millisecond: 0 });
    while (next.weekday !== weekday || next <= base) {
      next = next.plus({ days: 1 }).set({ hour, minute: 0, second: 0, millisecond: 0 });
    }
    return next;
  }
}
