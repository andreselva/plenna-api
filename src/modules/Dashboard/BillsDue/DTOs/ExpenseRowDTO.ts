export class ExpenseRowDTO {
    constructor(
        public readonly name: string,
        public readonly invoiceDueDate: string,
        public readonly value: number
    ) {}
}