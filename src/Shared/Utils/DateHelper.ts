import { DateTime } from "luxon";

export default class DateHelper {
    /**
     * Formata um objeto Date do JavaScript ou uma string no formato ISO para uma string 'YYYY-MM-DD'.
     * Retorna null se a data de entrada for inválida.
     * @param date A data a ser formatada, pode ser uma string ou um objeto Date.
     */
    static toISODate(date: string | Date): string | null {
        let luxonDateTime: DateTime;

        if (typeof date === 'string') {
            const normalizedDate = date.includes(' ')
                ? date.replace(' ', 'T')
                : date;

            luxonDateTime = DateTime.fromISO(normalizedDate, { zone: "America/Sao_Paulo" });
        } else {
            luxonDateTime = DateTime.fromJSDate(date, { zone: "America/Sao_Paulo" });
        }

        if (luxonDateTime.isValid) {
            return luxonDateTime.toISODate();
        }

        return null;
    }

    static toMonthYear(isoDate: string): string | null {
        const luxonDateTime = DateTime.fromISO(isoDate, { zone: "America/Sao_Paulo" });

        if (luxonDateTime.isValid) {
            return luxonDateTime.toFormat('MM/yyyy');
        }

        return null;
    }

    static toBrazilianDate(isoDate: string): string | null {
        const luxonDateTime = DateTime.fromISO(isoDate, { zone: "America/Sao_Paulo" });

        if (luxonDateTime.isValid) {
            return luxonDateTime.toFormat('dd/MM/yyyy');
        }

        return null;
    }

    static getStartingAndEndDateOfCurrentMonth() {
        return {
            initialDate: DateTime.local().startOf("month").toISODate(),
            endDate: DateTime.local().endOf("month").toISODate()
        }
    }

    static getMonthLabels(): Map<number, string> {
        return new Map<number, string>([
            [1, 'Jan'], [2, 'Fev'], [3, 'Mar'], [4, 'Abr'], [5, 'Maio'], [6, 'Jun'],
            [7, 'Jul'], [8, 'Ago'], [9, 'Set'], [10, 'Out'], [11, 'Nov'], [12, 'Dez'],
        ]);
    }
    
    static getMonthOfDate(date: string, twoDigits = false) {
        const dt = DateTime.fromISO(date, { zone: "America/Sao_Paulo" });
        if (twoDigits) {
            return dt.toFormat('MM');
        }
        return dt.month;
    }

    static getFirstAndLastDateByNumberOfMonths(quantity: number, plus: boolean = true): { initialDate: string, endDate: string} {
        if (plus) {
            return {
                initialDate: DateTime.local().startOf("month").toISODate(),
                endDate: DateTime.local().plus({ months: quantity }).endOf("month").toISODate()
            }
        }

        return {
            initialDate: DateTime.local().minus({ months: quantity }).startOf("month").toISODate(),
            endDate: DateTime.local().endOf("month").toISODate()
        }
    }

    static listMonthsBetween(initialDate: string, endDate: string) {
        const start = DateTime.fromISO(initialDate, { zone: "America/Sao_Paulo" }).startOf("month");
        const end = DateTime.fromISO(endDate, { zone: "America/Sao_Paulo" }).startOf("month");

        if (start.equals(end)) {
            return [{ y: start.year, m: start.month }];
        }

        const months: {y: number, m: number}[] = [];

        let current = start;
        while (current < end) {
            months.push({ y: current.year, m: current.month });
            current = current.plus({ months: 1 })
        }
        return months;
    }

    static getYearAndMonth(date: string) {
        const dt = DateTime.fromISO(date, { zone: "America/Sao_Paulo" });

        return {
            yearAndMonth: dt.toFormat("yyyy-MM"),
            month: dt.month
        };
    }

    static ymKey(y: number, m: number) {
        return `${y}-${String(m).padStart(2, '0')}`;
    }

    static getCurrentYear(): number {
        return Number(DateTime.local().setZone("America/Sao_Paulo").toFormat('yyyy'));
    }

    static getCurrentDate(): string {
        return DateTime.local({ zone: "America/Sao_Paulo" }).toFormat("yyyy-MM-dd HH:mm:ss");
    }

    static getCurrentISODate(): string {
        return DateTime.local({ zone: "America/Sao_Paulo" }).toFormat("yyyy-MM-dd");
    }

    static convertToDateTime(date: string): DateTime {
        return DateTime.fromISO(date, { zone: "America/Sao_Paulo" });
    }
}