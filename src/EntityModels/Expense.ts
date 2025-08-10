import EntityModel from "src/EntityModels/entity.model";
import DateHelper from "src/Shared/Utils/DateHelper";
import IExpenseRow from "src/Shared/interfaces/IExpenseRow";
import IEntity from "src/Shared/interfaces/IEntity";
import { ExpenseStatus } from "src/Finance/Expenses/Types/expense.status.type";
import { ExpenseDTO } from "src/Finance/Expenses/DTOs/ExpenseDTO";

export class Expense extends EntityModel implements IEntity {
    public id: number;
    public name: string;
    public description: string;
    public value: number;
    public invoiceDueDate: string;
    public idCategory: number;
    public idCreditCard: number = 0;
    public installments: number = 0;
    public typeOfInstallment: string;
    public sourceAccountId: number;
    public hasInstallments: boolean;
    public linkToInvoice: boolean;
    public idInvoice: number;
    public status: ExpenseStatus;
    public totalPaid?: number;
    public updateInstallments?: boolean;

    constructor() {
        super();
    }

    static fromEntity(entity: Expense) {
        const newExpense = new Expense(); 
        Object.assign(newExpense, entity);
        return newExpense;
    }

    static fromDTO(dto: ExpenseDTO) {
        const expense = new Expense();
        expense.id = dto.id ?? 0;
        expense.name = dto.name;
        expense.description = dto.description;
        expense.value = dto.value;
        expense.invoiceDueDate = dto.invoiceDueDate;
        expense.idCategory = dto.idCategory;
        expense.idCreditCard = dto.idCreditCard ?? 0;
        expense.installments = dto.installments ?? 0;
        expense.typeOfInstallment = dto.typeOfInstallment;
        expense.sourceAccountId = dto.sourceAccountId ?? 0;
        expense.hasInstallments = dto.hasInstallments;
        expense.linkToInvoice = dto.linkToInvoice;
        expense.idInvoice = dto.idInvoice ?? 0;
        expense.status = dto.status ?? ExpenseStatus.PENDING;
        expense.totalPaid = dto.totalPaid ?? 0;
        return expense;
    }

     /**
     * Método "fábrica" estático que cria uma instância de BankAccount
     * a partir de uma linha de dados crua vinda do banco de dados.
     * @param row O objeto de dados vindo da query.
     * @returns Uma nova instância de BankAccount.
     */
    static fromRow(row: IExpenseRow) {
        const expense = new Expense();
        expense.id = row.id;
        expense.name = row.name;
        expense.description = row.description;
        expense.value = Number(row.value);
        expense.invoiceDueDate = DateHelper.toISODate(row.invoiceDueDate) as string;
        expense.idCategory = row.idCategory;
        expense.idCreditCard = row.idCreditCard;
        expense.installments = row.installments;
        expense.typeOfInstallment = row.typeOfInstallment;
        expense.sourceAccountId = row.sourceAccountId;
        expense.hasInstallments = Boolean(row.hasInstallments);
        expense.linkToInvoice = Boolean(row.linkToInvoice);
        expense.idInvoice = row.idInvoice;
        expense.status = row.status;
        return expense;
    }

    getTableName() {
        return 'expense'; 
    }

    getPrimaryKey() {
        return 'id';
    }

    getIgnoredProperties() {
        return ['totalPaid', 'updateInstallments'];
    }
}