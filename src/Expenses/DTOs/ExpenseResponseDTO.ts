import { FormatDate } from "src/Helpers/DateHelper/FormatDate";

export class ExpenseResponseDTO {
    public readonly invoiceDueDate: string;

    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly description: string,
        public readonly value: number,
        invoiceDueDate: string,
        public readonly idCategory: number
    ) {
        this.invoiceDueDate = FormatDate.formatDateToDDMMYYYY(invoiceDueDate);
    }
}