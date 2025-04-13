import { RevenueDTO } from "../DTOs/RevenueDTO";

export default class Revenue {
    name: string;
    description: string;
    value: number;
    invoiceDueDate: string;
    idCategory: number
    id?: number;

    constructor(name: string, description: string, value: number, invoiceDueDate: string, idCategory: number, id?: number) {
        this.name = name;
        this.description = description;
        this.value = value;
        this.invoiceDueDate = invoiceDueDate;
        this.idCategory = idCategory;
        this.id = id;
    }

    getName(): string {
        return this.name;
    }

    getDescription(): string {
        return this.description;
    }

    getValue(): number {
        return this.value;
    }

    getInvoiceDueDate(): string {
        return this.invoiceDueDate;
    }

    getIdCategory(): number {
        return this.idCategory;
    }

    getId() {
        if (this.id === undefined) {
            throw new Error('ID is not set');
        }
        return this.id;
    }

    static fromDTO(dto: RevenueDTO): Revenue {
        return new Revenue(
            dto.name,
            dto.description,
            Number(dto.value),
            dto.invoiceDueDate,
            Number(dto.idCategory),
            dto.id
        );
    }
}