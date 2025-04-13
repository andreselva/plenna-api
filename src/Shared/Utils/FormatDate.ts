export class FormatDate {
    static formatToYYYYMMDD(dateInput: Date | string): string {
        let date: Date;

        if (typeof dateInput === 'string') {
            // Verifica se a string está no formato DD/MM/YYYY
            const [day, month, year] = dateInput.split('/');
            if (!day || !month || !year) {
                throw new Error('Data inválida. Certifique-se de que está no formato DD/MM/YYYY.');
            }
            // Cria a data no formato correto
            date = new Date(Number(year), Number(month) - 1, Number(day));
        } else {
            date = dateInput;
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    static formatDateToDDMMYYYY(dateInput: string | Date): string {
        let date: Date;

        if (typeof dateInput === 'string') {
            if (dateInput.includes('-')) {
                // Verifica se a string está no formato YYYY-MM-DD
                const [year, month, day] = dateInput.split('-');
                if (!year || !month || !day) {
                    throw new Error('Data inválida. Certifique-se de que está no formato YYYY-MM-DD.');
                }
                // Cria a data no formato correto
                date = new Date(Number(year), Number(month) - 1, Number(day));
            } else {
                // Verifica se a string está no formato DD/MM/YYYY
                const [day, month, year] = dateInput.split('/');
                if (!day || !month || !year) {
                    throw new Error('Data inválida. Certifique-se de que está no formato DD/MM/YYYY.');
                }
                // Cria a data no formato correto
                date = new Date(Number(year), Number(month) - 1, Number(day));
            }
        } else {
            date = dateInput;
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}/${month}/${year}`;
    }
}