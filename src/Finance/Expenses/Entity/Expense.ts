import DateHelper from "src/Shared/Utils/DateHelper";
import { ExpenseDTO } from "../DTOs/ExpenseDTO";
import { ExpenseStatus } from "../Types/expense.status.type";

export class Expense {
    public name: string;
    public description: string;
    public value: number;
    public invoiceDueDate: string;
    public idCategory: number;
    public idCreditCard: number = 0;
    public installments: number = 0;
    public typeOfInstallment: string = 'U';
    public sourceAccountId: number;
    public hasInstallments: boolean;
    public linkToInvoice: boolean;
    public idInvoice: number;
    public status: ExpenseStatus = ExpenseStatus.PENDING;
    public id?: number;

    constructor(dto: ExpenseDTO | Expense) {
        if (dto instanceof Expense) {
            // Se for uma instância de Expense, copia os valores diretamente
            Object.assign(this, dto);
        } else {
            this.name = dto.name;
            this.description = dto.description;
            this.value = Number(dto.value);
            this.invoiceDueDate = DateHelper.toISODate(dto.invoiceDueDate) ?? '';
            this.idCategory = Number(dto.idCategory);
            this.idCreditCard = Number(dto.idCreditCard);
            this.installments = Number(dto.installments);
            this.typeOfInstallment = dto.typeOfInstallment;
            this.sourceAccountId = dto.sourceAccountId ? Number(dto.sourceAccountId) : 0;
            this.hasInstallments = Boolean(dto.hasInstallments);
            this.linkToInvoice = Boolean(dto.linkToInvoice);
            this.idInvoice = dto.idInvoice !== "" ? Number(dto.idInvoice) : 0;
            this.status = Object.values(ExpenseStatus).includes(dto.status) ? dto.status : ExpenseStatus.PENDING;
            this.id = dto.id;
        }
    }

    getName() {
        return this.name;
    }

    getDescription() {
        return this.description;
    }

    getValue() {
        return this.value;
    }

    getInvoiceDueDate() {
        return this.invoiceDueDate;
    }

    getIdCategory() {
        return this.idCategory;
    }

    getId(): number {
        return this.id ?? 0;
    }

    getIdCreditCard(): number {
        return this.idCreditCard ?? 0;
    }

    getInstallments() {
        return this.installments ?? 0;
    }

    getTypeOfInstallments() {
        return this.typeOfInstallment ?? 'U';
    }

    getSourceAccountId() {
        return this.sourceAccountId ?? 0;
    }

    getHasInstallments() {
        return this.hasInstallments;
    }

    getLinkToInvoice() {
        return this.linkToInvoice;
    }

    getIdInvoice() {
        return this.idInvoice;
    }

    getStatus(): ExpenseStatus {
        return this.status;
    }

    setStatus(status: ExpenseStatus) {
        this.status = status;
    }

    setId(id: number) {
        this.id = id;
    }

    setIdInvoice(id: number) {
        this.idInvoice = id;
    }

    setSourceAccountId(id: number) {
        this.sourceAccountId = id;
    }

    setInvoiceDueDate(date: string) {
        this.invoiceDueDate = date;
    }

    setIdCreditCard(id: number) {
        this.idCreditCard = id;
    }
}