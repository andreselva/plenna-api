import { RevenueDTO } from "../DTOs/RevenueDTO";

export default class Revenue {
    name: string;
    description: string;
    value: number;
    invoiceDueDate: string;
    idCategory: number
    id?: number;
    installments?: number = 0;
    typeOfInstallments?: string = 'U';
    sourceAccountId?: number = 0;

    constructor(
        name: string,
        description: string,
        value: number,
        invoiceDueDate: string,
        idCategory: number,
        installments: number = 0,
        typeOfInstallments: string = 'U',
        sourceAccountId: number = 0,
        id?: number,
    ) {
        this.name = name;
        this.description = description;
        this.value = value;
        this.invoiceDueDate = invoiceDueDate;
        this.idCategory = idCategory;
        this.installments = installments;
        this.typeOfInstallments = typeOfInstallments;
        this.sourceAccountId = sourceAccountId;
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

    setId(id: number) {
        if (this.id === undefined || !this.id) {
            this.id = id;
        }
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
            dto.id,
        );
    }
}