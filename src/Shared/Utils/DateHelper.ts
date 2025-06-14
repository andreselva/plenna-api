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

}