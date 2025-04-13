export class FormatDate {
    static formatToYYYYMMDD(dateInput: Date | string): string {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    static formatDateToDDMMYYYY(dateInput: string | Date): string {
        let date: Date;
        if (typeof dateInput === 'string') {
            date = new Date(dateInput);
        } else {
            date = dateInput;
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}/${month}/${year}`;
    }
}