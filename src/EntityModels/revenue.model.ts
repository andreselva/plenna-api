import EntityModelInterface from "./entity.model.interface";

export default class RevenueModel implements EntityModelInterface {
    id: number;
    name: string;
    description: string;
    value: number;
    invoiceDueDate: string;
    idCategory: number;
    installments: number;
    typeOfInstallments: 'U' | 'P' | 'F';
    sourceAccountId: number;
    hasInstallments: boolean;

    constructor() {
        this.id = 0;
        this.name = '';
        this.description = '';
        this.value = 0;
        this.invoiceDueDate = '';
        this.idCategory = 0;
        this.installments = 0;
        this.typeOfInstallments = 'U';
        this.sourceAccountId = 0;
        this.hasInstallments = false;
    }
    
    setTableName(): string {
        return 'revenue';
    }

    setPrimaryKey(): string {
        return 'id';
    }
}