import { FormatDate } from "src/Shared/Utils/FormatDate";

export class RevenueResponseDTO {
    public readonly invoiceDueDate: string;
    
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly description: string,
        public readonly value: number,
        invoiceDueDate: string,
        public readonly idCategory: number,
    ) {
        this.invoiceDueDate = FormatDate.formatDateToDDMMYYYY(invoiceDueDate);
    }
}