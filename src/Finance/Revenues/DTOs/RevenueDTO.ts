export class RevenueDTO {
    name: string;
    description: string;
    value: number;
    invoiceDueDate: string;
    idCategory: number;
    installments: number;
    typeOfInstallments: string;
    sourceAccountId: number;
    hasInstallments: boolean;
    updateInstallments: boolean;
    id?: number;
}