import { ExpenseStatus } from "../Types/expense.status.type";

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
        public readonly hasInstallments: boolean,
        public readonly installments: number,
        public readonly linkToInvoice: boolean,
        public readonly idInvoice: number,
        public readonly status: ExpenseStatus
    ) {
        this.id = Number(id);
        this.value = Number(value);
        this.idCategory = Number(idCategory);
        this.idCreditCard = Number(idCreditCard);
        this.sourceAccountId = Number(sourceAccountId);
        this.installments = Number(installments);
        this.hasInstallments = Boolean(hasInstallments);
        this.linkToInvoice = Boolean(linkToInvoice);
        this.idInvoice = Number(idInvoice);
    }
}