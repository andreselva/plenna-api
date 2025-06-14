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
}