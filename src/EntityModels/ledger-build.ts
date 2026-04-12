import IEntity from 'src/Shared/interfaces/IEntity';
import { ILedgerBuild } from 'src/Shared/interfaces/ILedgerBuild';
import EntityModel from './entity.model';

export class LedgerBuild extends EntityModel implements IEntity {
    public id: number;
    public clientId: number;
    public builtAt: string;
    public totalLiquidBalance: number;
    public openChargesCount: number;
    public openChargesValue: number;
    public pendingExpensesCount: number;
    public pendingExpensesValue: number;
    public pendingRevenuesCount: number;
    public pendingRevenuesValue: number;
    public buildData: object;
    public createdAt: string;

    static fromRow(row: ILedgerBuild): LedgerBuild {
        const build = new LedgerBuild();
        build.id = row.id;
        build.clientId = row.clientId;
        build.builtAt = row.builtAt;
        build.totalLiquidBalance = row.totalLiquidBalance;
        build.openChargesCount = row.openChargesCount;
        build.openChargesValue = row.openChargesValue;
        build.pendingExpensesCount = row.pendingExpensesCount;
        build.pendingExpensesValue = row.pendingExpensesValue;
        build.pendingRevenuesCount = row.pendingRevenuesCount;
        build.pendingRevenuesValue = row.pendingRevenuesValue;
        build.buildData = row.buildData;
        build.createdAt = row.createdAt;
        return build;
    }

    getTableName(): string {
        return 'ledger_builds';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return [];
    }
}
