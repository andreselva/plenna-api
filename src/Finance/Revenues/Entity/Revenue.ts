import { RevenueDTO } from "../DTOs/RevenueDTO";

export default class Revenue {
    name: string;
    description: string;
    value: number;
    invoiceDueDate: string;
    idCategory: number
    id?: number | null;
    installments?: number;
    typeOfInstallments?: string;
    sourceAccountId?: number;

    constructor(
        name: string,
        description: string,
        value: number,
        invoiceDueDate: string,
        idCategory: number,
        id?: number,
        installments?: number,
        typeOfInstallments?: string,
        sourceAccountId?: number
    ) {
        this.name = name;
        this.description = description;
        this.value = value;
        this.invoiceDueDate = invoiceDueDate;
        this.idCategory = idCategory;
        this.id = id;
        this.installments = installments;
        this.typeOfInstallments = typeOfInstallments;
        this.sourceAccountId = sourceAccountId;
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
        if (this.id === undefined || !this.id) {
            return 0;
        }
        return this.id;
    }

    getInstallments() {
        if (this.installments === undefined) {
            return 0;
        }
        return this.installments;
    }

    getTypeOfInstallments() {
        if (this.typeOfInstallments === undefined || !this.typeOfInstallments) {
            throw new Error('Type of installments not assign!');
        }
        return this.typeOfInstallments;
    }

    getSourceAccountId() {
        if (this.sourceAccountId === undefined || !this.sourceAccountId) {
            return 0;
        }
        return this.sourceAccountId;
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
            dto.id,
            dto.installments,
            dto.typeOfInstallment
        );
    }
}