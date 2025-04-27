import { ExpenseDTO } from "../DTOs/ExpenseDTO";

export class Expense {
    public name: string;
    public description: string;
    public value: number;
    public invoiceDueDate: string;
    public idCategory: number;
    public id?: number;
    public idCreditCard?: number;

    constructor(name: string, description: string, value: number, invoiceDueDate: string, idCategory: number, idCreditCard?: number, id?: number) {
        this.name = name;
        this.description = description;
        this.value = value;
        this.invoiceDueDate = invoiceDueDate;
        this.idCategory = idCategory;
        this.idCreditCard = idCreditCard;
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
        if (this.id === undefined) {
            throw new Error('ID is not set');
        }
        return this.id;
    }

    getIdCreditCard(): number {
        if (this.idCreditCard === undefined) {
            throw new Error('ID Credit Card is not set');
        }
        return this.idCreditCard;
    }

    static fromDTO(dto: ExpenseDTO): Expense {
        return new Expense(
            dto.name,
            dto.description,
            Number(dto.value),
            dto.invoiceDueDate,
            Number(dto.idCategory),
            Number(dto.idCreditCard),
            dto.id,
        )
    }
}