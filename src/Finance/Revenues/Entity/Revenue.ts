import { RevenueDTO } from "../DTOs/RevenueDTO";

export default class Revenue {
    public name: string;
    public description: string;
    public value: number;
    public invoiceDueDate: string;
    public idCategory: number
    public installments: number = 0;
    public typeOfInstallments: string = 'U';
    public sourceAccountId: number = 0;
    public hasInstallments: boolean = false;
    public id?: number;

    constructor(name: string, description: string, value: number, invoiceDueDate: string, idCategory: number, installments: number = 0, typeOfInstallments: string = 'U', sourceAccountId: number = 0, hasInstallments: boolean = false, id?: number) {
        this.name = name;
        this.description = description;
        this.value = value;
        this.invoiceDueDate = invoiceDueDate;
        this.idCategory = idCategory;
        this.installments = installments;
        this.typeOfInstallments = typeOfInstallments;
        this.sourceAccountId = sourceAccountId;
        this.hasInstallments = hasInstallments;
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
        return this.id ?? 0;
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

    setId(id: number) {
        if (this.id === undefined || !this.id) {
            this.id = id;
        }
    }

    setInvoiceDueDate(date: string) {
        this.invoiceDueDate = date;
    }

    static fromDTO(dto: RevenueDTO): Revenue {
        return new Revenue(
            dto.name,
            dto.description,
            Number(dto.value),
            dto.invoiceDueDate,
            Number(dto.idCategory),
            Number(dto.installments),
            dto.typeOfInstallment,
            dto.sourceAccountId,
            dto.hasInstallments || false,
            dto.id,
        );
    }
}