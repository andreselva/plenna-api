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
            luxonDateTime = DateTime.fromISO(date);
        } else {
            luxonDateTime = DateTime.fromJSDate(date);
        }

        if (luxonDateTime.isValid) {
            return luxonDateTime.toISODate();
        }

        return null;
    }

    /**
     * Extrai e formata o mês e o ano de uma string de data.
     * Recebe uma data no formato 'YYYY-MM-DD' e retorna 'MM/YYYY'.
     * Retorna null se a data de entrada for inválida.
     * @param isoDate A string da data no formato 'YYYY-MM-DD'.
     */
    static toMonthYear(isoDate: string): string | null {
        const luxonDateTime = DateTime.fromISO(isoDate);

        if (luxonDateTime.isValid) {
            return luxonDateTime.toFormat('MM/yyyy');
        }

        return null;
    }

    /**
     * Converte uma string de data do formato 'YYYY-MM-DD' para 'DD/MM/YYYY'.
     * Retorna null se a data de entrada for inválida.
     * @param isoDate A string da data no formato 'YYYY-MM-DD'.
     */
    static toBrazilianDate(isoDate: string): string | null {
        const luxonDateTime = DateTime.fromISO(isoDate);

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
    
    /**
     * Retorna o dígito do mês da data enviada
     * 
     * @param date string - A data desejada para extrair o mês.
     * @param twoDigits - boolean - Define se retorna o mês com apenas 1 dígito ou 2 (Ex: 1 ou 01)
     * @returns 
     */
    static getMonthOfDate(date: string, twoDigits = false) {
        const dt = DateTime.fromISO(date, { zone: "America/Sao_Paulo" });
        if (twoDigits) {
            return dt.toFormat('MM');
        }
        return dt.month;
    }

    /**
     * A função retorna uma data inicial e uma data final com base na quantidade de meses passados por parâmetro
     * Será considerado sempre a data atual para o cálculo.
     * 
     * @param quantity A quantidade de meses em que as datas devem ser calculadas.
     * @param plus Para definir se soma os meses ou se subtrai.
     * @returns 
     */
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

    /**
     * Retorna os meses existentes em um intervalo de datas.
     * 
     * @param initialDate - string - A data inicial 
     * @param endDate - string - A data final
     * @returns 
     */
    static listMonthsBetween(initialDate: string, endDate: string) {
        const start = DateTime.fromISO(initialDate).startOf("month");
        const end = DateTime.fromISO(endDate).startOf("month");

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

    /**
     * Retorna o objeto com o ano-mes e mes.
     * 
     * @param date - string - A data para extrair os dados.
     * @returns 
     */
    static getYearAndMonth(date: string) {
        return {
            yearAndMonth: DateTime.fromISO(date).toFormat("yyyy-MM"),
            month: DateTime.fromISO(date).month
        };
    }

    static ymKey(y: number, m: number) {
        return `${y}-${String(m).padStart(2, '0')}`;
    }

    static getCurrentYear(): number {
        return Number(DateTime.local().toFormat('yyyy'));
    }
}