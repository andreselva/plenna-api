import DateHelper from "src/Shared/Utils/DateHelper";
import { RevenueDTO } from "../DTOs/RevenueDTO";

export default class Revenue {
    public name: string;
    public description: string;
    public value: number;
    public invoiceDueDate: string;
    public idCategory: number
    public installments: number;
    public typeOfInstallments: string = 'U';
    public sourceAccountId: number = 0;
    public hasInstallments: boolean = false;
    public id?: number;

    constructor(dto: RevenueDTO | Revenue) {
        if (dto instanceof Revenue) {
            Object.assign(this, dto);
        } else {
            this.name = dto.name;
            this.description = dto.description;
            this.value = dto.value;
            this.invoiceDueDate = DateHelper.toISODate(dto.invoiceDueDate) ?? '';
            this.idCategory = dto.idCategory;
            this.installments = dto.installments;
            this.typeOfInstallments = dto.typeOfInstallments;
            this.sourceAccountId = dto.sourceAccountId ?? 0;
            this.hasInstallments = Boolean(dto.hasInstallments);
            this.id = dto.id ?? 0;
        }
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

    setSourceAccountId(id: number) {
        this.sourceAccountId = id;
    }
}