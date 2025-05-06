export class ExpenseRowDTO {
    name: string;
    description: string;
    value: number;
    invoiceDueDate: string;
    idCategory: number;
    idCreditCard: number;
    installments: number;
    typeOfInstallments: string;
    sourceAccountId: number;
    hasInstallments: boolean;
    id?: number;
}