import { FormatDate } from "src/Shared/Utils/FormatDate";

export class BillsDueDTO {
    public readonly invoiceDueDate: string;

    constructor(
        public readonly name: string,
        invoiceDueDate: string,
        public readonly value: number
    ) {
        this.invoiceDueDate = FormatDate.formatDateToDDMMYYYY(invoiceDueDate);
    }
}