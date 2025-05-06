export class ExpenseResponseDTO {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly description: string,
        public readonly value: number,
        public readonly invoiceDueDate: string,
        public readonly idCategory: number,
        public readonly idCreditCard: number,
        public readonly typeOfInstallment: string,
        public readonly sourceAccountId: number,
        public readonly hasInstallments: boolean
    ) {
    }
}