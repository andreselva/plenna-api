import { ExpenseDTO } from "../DTOs/ExpenseDTO";

export class Expense {
    public name: string;
    public description: string;
    public value: number;
    public invoiceDueDate: string;
    public idCategory: number;
    public idCreditCard: number = 0;
    public installments: number = 0;
    public typeOfInstallments: string = 'U';
    public sourceAccountId: number = 0;
    public hasInstallments: boolean;
    public linkToInvoice: boolean;
    public idInvoice: number;
    public id?: number;

    constructor(name: string, description: string, value: number, invoiceDueDate: string, idCategory: number, idCreditCard: number, installments: number, typeOfInstallments: string, sourceAccountId: number, hasInstallments: boolean, linkToInvoice: boolean, idInvoice: number, id?: number) {
        this.name = name;
        this.description = description;
        this.value = value;
        this.invoiceDueDate = invoiceDueDate;
        this.idCategory = idCategory;
        this.idCreditCard = idCreditCard;
        this.installments = installments;
        this.typeOfInstallments = typeOfInstallments;
        this.sourceAccountId = sourceAccountId;
        this.hasInstallments = hasInstallments;
        this.linkToInvoice = linkToInvoice;
        this.idInvoice = idInvoice;
        this.id = id;
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
        return this.typeOfInstallments ?? 'U';
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

    setId(id: number) {
        if (this.id === undefined || !this.id) {
            this.id = id;
        }
    }

    setIdInvoice(id: number) {
        this.idInvoice = id;
    }

    static fromDTO(dto: ExpenseDTO): Expense {
        return new Expense(
            dto.name,
            dto.description,
            dto.value,
            dto.invoiceDueDate,
            Number(dto.idCategory),
            Number(dto.idCreditCard) || 0,
            Number(dto.installments) || 0,
            dto.typeOfInstallment,
            Number(dto.sourceAccountId) || 0,
            dto.hasInstallments || false,
            dto.linkToInvoice || false,
            Number(dto.idInvoice),
            dto.id,
        )
    }
}