export default interface IRevenueRow {
    id: number;
    name: string;
    description: string;
    value: number;
    invoiceDueDate: string;
    idCategory: number;
    installments: number;
    typeOfInstallments: string;
    sourceAccountId: number;
    hasInstallments: number
}