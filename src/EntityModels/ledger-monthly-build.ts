import IEntity from 'src/Shared/interfaces/IEntity';
import { ILedgerMonthlyBuild } from 'src/Shared/interfaces/ILedgerMonthlyBuild';
import EntityModel from './entity.model';

export class LedgerMonthlyBuild extends EntityModel implements IEntity {
    public id: number;
    public clientId: number;
    public period: string;
    public closedAt: string | null;
    public closingBalance: number | null;
    public openChargesCount: number;
    public openChargesValue: number;
    public pendingExpenses: number;
    public pendingRevenues: number;
    public buildData: object;
    public builtAt: string;
    public createdAt: string;

    static fromRow(row: ILedgerMonthlyBuild): LedgerMonthlyBuild {
        const build = new LedgerMonthlyBuild();
        build.id = row.id;
        build.clientId = row.clientId;
        build.period = row.period;
        build.closedAt = row.closedAt;
        build.closingBalance = row.closingBalance;
        build.openChargesCount = row.openChargesCount;
        build.openChargesValue = row.openChargesValue;
        build.pendingExpenses = row.pendingExpenses;
        build.pendingRevenues = row.pendingRevenues;
        build.buildData = row.buildData;
        build.builtAt = row.builtAt;
        build.createdAt = row.createdAt;
        return build;
    }

    getTableName(): string {
        return 'ledger_monthly_builds';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return [];
    }
}
