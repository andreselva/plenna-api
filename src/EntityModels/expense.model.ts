import { ExpenseStatus } from "src/Finance/Expenses/Types/expense.status.type";
import EntityModelInterface from "./entity.model.interface";

export default class ExpenseModel implements EntityModelInterface {
    id: number;
    name: string;
    description: string;
    value: number;
    invoiceDueDate: string;
    idCategory: number;
    idCreditCard: number;
    installments: number;
    typeOfInstallment: 'U' | 'P' | 'F';
    sourceAccountId: number;
    hasInstallments: boolean;
    status: ExpenseStatus;
    paymentDate: string;
    idInvoice: number;
    linkToInvoice: boolean;

    constructor() {
        this.id = 0;
        this.name = '';
        this.description = '';
        this.value = 0;
        this.invoiceDueDate = '';
        this.idCategory = 0;
        this.idCreditCard = 0;
        this.installments = 0;
        this.typeOfInstallment = 'U';
        this.sourceAccountId = 0;
        this.hasInstallments = false;
        this.status = ExpenseStatus.PENDING;
        this.paymentDate = '';
        this.idInvoice = 0;
        this.linkToInvoice = false;
    }

    setTableName(): string {
        return 'expense';
    }

    setPrimaryKey(): string {
        return 'id';
    }
}