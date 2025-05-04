export class RevenueDTO {
    name: string;
    description: string;
    value: number;
    invoiceDueDate: string;
    idCategory: string;
    id?: number;
    installments?: number;
    typeOfInstallment?: string;
}