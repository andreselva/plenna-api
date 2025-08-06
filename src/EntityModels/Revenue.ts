import DateHelper from "src/Shared/Utils/DateHelper";
import { RevenueDTO } from "../DTOs/RevenueDTO";
import EntityModel from "src/EntityModels/entity.model";
import IEntity from "src/Shared/interfaces/IEntity";
import IRevenueRow from "src/Shared/interfaces/IRevenueRow";

export default class Revenue extends EntityModel implements IEntity {
    public name: string;
    public description: string;
    public value: number;
    public invoiceDueDate: string;
    public idCategory: number
    public installments: number;
    public typeOfInstallments: string = 'U';
    public sourceAccountId: number;
    public hasInstallments: boolean = false;
    public id: number;

    constructor() {
        super();
    }

    static fromEntity(entity: Revenue) {
        const newRevenue = new Revenue();
        Object.assign(newRevenue, entity);
        return newRevenue;
    }

    static fromDTO(dto: RevenueDTO) {
        const revenue = new Revenue();
        revenue.name = dto.name;
        revenue.description = dto.description;
        revenue.invoiceDueDate = dto.invoiceDueDate;
        revenue.idCategory = dto.idCategory ?? 0;
        revenue.installments = dto.installments ?? 0;
        revenue.typeOfInstallments = dto.typeOfInstallments;
        revenue.sourceAccountId = dto.sourceAccountId ?? 0;
        revenue.hasInstallments = dto.hasInstallments;
        revenue.value = dto.value;
        revenue.id = dto.id ?? 0;
        return revenue;
    }

     /**
     * Método "fábrica" estático que cria uma instância de BankAccount
     * a partir de uma linha de dados crua vinda do banco de dados.
     * @param row O objeto de dados vindo da query.
     * @returns Uma nova instância de BankAccount.
     */
    static fromRow(row: IRevenueRow) {
        const revenue = new Revenue();
        revenue.id = row.id;
        revenue.name = row.name;
        revenue.description = row.description;
        revenue.value = row.value;
        revenue.invoiceDueDate = DateHelper.toISODate(row.invoiceDueDate) as string;
        revenue.idCategory = row.idCategory;
        revenue.installments = row.installments;
        revenue.typeOfInstallments = row.typeOfInstallments;
        revenue. sourceAccountId = row.sourceAccountId;
        revenue.hasInstallments = Boolean(row.hasInstallments);
        return revenue;
    }

    getTableName(): string {
        return 'revenue';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return [];
    }
}