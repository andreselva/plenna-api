import { ExpenseStatus } from "src/Finance/Expenses/Types/expense.status.type";

export default interface IExpenseRow {
    id: number;
    name: string;
    description: string;
    value: number;
    invoiceDueDate: string;
    idCategory: number;
    idCreditCard: number;
    installments: number;
    typeOfInstallment: string;
    sourceAccountId: number;
    hasInstallments: number;
    linkToInvoice: number;
    idInvoice: number;
    status: ExpenseStatus;
    paymentDate: string;
    clientId: number;
}