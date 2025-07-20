import { ExpenseStatus } from "../Types/expense.status.type";

export class ExpenseDTO {
    name: string;
    description: string;
    value: number;
    invoiceDueDate: string;
    idCategory: number | string;
    idCreditCard: number | string;
    installments: number;
    typeOfInstallment: string;
    sourceAccountId: number | string;
    hasInstallments: boolean;
    updateInstallments: boolean;
    linkToInvoice: boolean;
    idInvoice: number | string;
    status: ExpenseStatus;
    id?: number;
}