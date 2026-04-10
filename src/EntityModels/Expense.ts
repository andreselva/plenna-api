import EntityModel from 'src/EntityModels/entity.model';
import DateHelper from 'src/Shared/Utils/DateHelper';
import IExpenseRow from 'src/Shared/interfaces/IExpenseRow';
import IEntity from 'src/Shared/interfaces/IEntity';
import { ExpenseStatus } from 'src/modules/Finance/Expenses/Types/expense.status.type';
import { ExpenseDTO } from 'src/modules/Finance/Expenses/DTOs/ExpenseDTO';

export class Expense extends EntityModel implements IEntity {
    public id: number = 0;
    public clientId: number;
    public name: string = '';
    public description: string = '';
    public value: number = 0;
    public invoiceDueDate: string = '';
    public idCategory: number = 0;
    public idCreditCard: number = 0;
    public idBankAccount: number = 0;
    public installments: number = 0;
    public typeOfInstallment: string = 'U';
    public sourceAccountId: number = 0;
    public hasInstallments: boolean = false;
    public linkToInvoice: boolean = false;
    public idInvoice: number = 0;
    public status: ExpenseStatus = ExpenseStatus.PENDING;
    public totalPaid: number = 0;
    public updateInstallments: boolean = false;
    public idSubcategory: number;

    public static ignoredProperties: string[] = ['totalPaid', 'updateInstallments'];

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
        expense.idBankAccount = dto.idBankAccount ?? 0;
        expense.installments = dto.installments ?? 0;
        expense.typeOfInstallment = dto.typeOfInstallment;
        expense.sourceAccountId = dto.sourceAccountId ?? 0;
        expense.hasInstallments = dto.hasInstallments;
        expense.linkToInvoice = dto.linkToInvoice;
        expense.idInvoice = dto.idInvoice ?? 0;
        expense.status = dto.status ?? ExpenseStatus.PENDING;
        expense.totalPaid = dto.totalPaid ?? 0;
        expense.idSubcategory = dto.idSubcategory;
        return expense;
    }

    static fromRow(row: IExpenseRow) {
        const expense = new Expense();
        expense.id = row.id;
        expense.name = row.name;
        expense.description = row.description;
        expense.value = Number(row.value);
        expense.invoiceDueDate = DateHelper.toISODate(row.invoiceDueDate) as string;
        expense.idCategory = row.idCategory;
        expense.idCreditCard = row.idCreditCard;
        expense.idBankAccount = row.idBankAccount ?? 0;
        expense.installments = row.installments;
        expense.typeOfInstallment = row.typeOfInstallment;
        expense.sourceAccountId = row.sourceAccountId;
        expense.hasInstallments = Boolean(row.hasInstallments);
        expense.linkToInvoice = Boolean(row.linkToInvoice);
        expense.idInvoice = row.idInvoice;
        expense.status = row.status;
        expense.clientId = row.clientId;
        expense.idSubcategory = row.idSubcategory;
        return expense;
    }

    getTableName() {
        return 'expense';
    }

    getPrimaryKey() {
        return 'id';
    }

    getIgnoredProperties() {
        return Expense.ignoredProperties;
    }

    addIgnoredProperty(property: string) {
        Expense.ignoredProperties.push(property);
    }
}
