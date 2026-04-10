import { RevenueStatus } from "src/modules/Finance/Revenues/Types/revenue.status.type";

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
    status: RevenueStatus;
    clientId: number;
    idBankAccount: number;
    customerId: number;
    paymentMethodId: number;
}