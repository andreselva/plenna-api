import DateHelper from 'src/Shared/Utils/DateHelper';
import EntityModel from 'src/EntityModels/entity.model';
import IEntity from 'src/Shared/interfaces/IEntity';
import IRevenueRow from 'src/Shared/interfaces/IRevenueRow';
import { RevenueDTO } from 'src/modules/Finance/Revenues/DTOs/RevenueDTO';
import { RevenueStatus } from 'src/modules/Finance/Revenues/Types/revenue.status.type';

export default class Revenue extends EntityModel implements IEntity {
    public id: number = 0;
    public clientId: number = 0;
    public name: string = '';
    public description: string = '';
    public value: number = 0;
    public invoiceDueDate: string = '';
    public idCategory: number = 0;
    public idBankAccount: number = 0;
    public installments: number = 0;
    public typeOfInstallments: string = 'U';
    public sourceAccountId: number = 0;
    public hasInstallments: boolean = false;
    public status: RevenueStatus = RevenueStatus.PENDING;
    public totalPaid: number = 0;
    public customerId: number = 0;
    public paymentMethodId: number = 0;

    public static ignoredProperties: string[] = ['totalPaid'];

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
        revenue.idBankAccount = dto.idBankAccount ?? 0;
        revenue.installments = dto.installments ?? 0;
        revenue.typeOfInstallments = dto.typeOfInstallments;
        revenue.sourceAccountId = dto.sourceAccountId ?? 0;
        revenue.hasInstallments = dto.hasInstallments;
        revenue.value = dto.value;
        revenue.status = dto.status;
        revenue.id = dto.id ?? 0;
        revenue.customerId = dto.customerId ?? 0;
        revenue.paymentMethodId = dto.paymentMethodId ?? 0;
        return revenue;
    }

    static fromRow(row: IRevenueRow) {
        const revenue = new Revenue();
        revenue.id = row.id;
        revenue.name = row.name;
        revenue.description = row.description;
        revenue.value = row.value;
        revenue.invoiceDueDate = DateHelper.toISODate(row.invoiceDueDate) as string;
        revenue.idCategory = row.idCategory;
        revenue.idBankAccount = row.idBankAccount ?? 0;
        revenue.installments = row.installments;
        revenue.typeOfInstallments = row.typeOfInstallments;
        revenue.sourceAccountId = row.sourceAccountId;
        revenue.hasInstallments = Boolean(row.hasInstallments);
        revenue.status = row.status;
        revenue.clientId = row.clientId ?? 0;
        revenue.customerId = row.customerId ?? 0;
        revenue.paymentMethodId = row.paymentMethodId ?? 0;
        return revenue;
    }

    getTableName(): string {
        return 'revenue';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return Revenue.ignoredProperties;
    }

    addIgnoredProperty(property: string) {
        Revenue.ignoredProperties.push(property);
    }
}