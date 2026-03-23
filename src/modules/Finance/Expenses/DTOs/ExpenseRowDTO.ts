import { ExpenseStatus } from '../Types/expense.status.type';

export class ExpenseRowDTO {
    name: string;
    description: string;
    value: number;
    invoiceDueDate: string;
    idCategory: number;
    idCreditCard: number;
    idBankAccount: number;
    installments: number;
    typeOfInstallment: string;
    sourceAccountId: number;
    hasInstallments: boolean;
    linkToInvoice: boolean;
    idInvoice: number;
    status: ExpenseStatus;
    id: number;
}