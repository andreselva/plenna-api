
export class RevenueResponseDTO {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly description: string,
        public readonly value: number,
        public readonly invoiceDueDate: string,
        public readonly idCategory: number,
        public readonly installments: number,
        public readonly typeOfInstallments: string,
        public readonly sourceAccountId: number,
        public readonly hasInstallments: boolean
    ) {}
}