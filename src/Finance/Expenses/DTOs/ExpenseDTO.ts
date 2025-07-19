export class ExpenseDTO {
    name: string;
    description: string;
    value: number;
    invoiceDueDate: string;
    idCategory: number;
    idCreditCard: number;
    installments: number;
    typeOfInstallment: string;
    sourceAccountId: number;
    hasInstallments: boolean;
    updateInstallments: boolean;
    linkToInvoice: boolean;
    idInvoice: number;
    id?: number;
}