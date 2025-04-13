import { ExpenseDTO } from "../DTOs/ExpenseDTO";

export class Expense {
    public name: string;
    public description: string;
    public value: number;
    public invoiceDueDate: string;
    public idCategory: number;
    public id?: number;

    constructor(name: string, description: string, value: number, invoiceDueDate: string, idCategory: number, id?: number) {
        this.name = name;
        this.description = description;
        this.value = value;
        this.invoiceDueDate = invoiceDueDate;
        this.idCategory = idCategory;
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

    getId() {
        return this.id;
    }

    static fromDTO(dto: ExpenseDTO): Expense {
        return new Expense(
            dto.name,
            dto.description,
            Number(dto.value),
            dto.invoiceDueDate,
            Number(dto.idCategory),
            dto.id,
        )
    }
}