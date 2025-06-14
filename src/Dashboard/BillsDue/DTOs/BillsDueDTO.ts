import DateHelper from "src/Shared/Utils/DateHelper";

export class BillsDueDTO {
    public readonly invoiceDueDate: string;

    constructor(
        public readonly name: string,
        invoiceDueDate: string,
        public readonly value: number
    ) {
        this.invoiceDueDate = DateHelper.toBrazilianDate(invoiceDueDate) as string;
    }
}