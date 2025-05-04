export class ExpenseResponseDTO {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly description: string,
        public readonly value: number,
        public readonly invoiceDueDate,
        public readonly idCategory: number,
        public readonly idCreditCard: number,
    ) {
    }
}