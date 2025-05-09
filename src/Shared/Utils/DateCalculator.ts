import { DateTime } from "luxon";

export default class DateCalculator {
    static calculate(inicialDate: string, numberOfDates: number) {
        const firstDate = DateTime.fromISO(inicialDate);
        const dates: (string )[] = [];
        for (let i = 1; i < numberOfDates; i++) {
            const newDate = firstDate.plus({ months: i });
            dates[i] = newDate.toISODate();
        }
        return dates;
    }
}