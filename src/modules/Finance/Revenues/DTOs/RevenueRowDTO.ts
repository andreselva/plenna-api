export interface RevenueRowDTO {
    name: string;
    description: string;
    value: number;
    invoiceDueDate: string;
    idCategory: number;
    idBankAccount: number;
    installments: number;
    typeOfInstallments: string;
    sourceAccountId: number;
    hasInstallments: boolean;
    id: number;
}