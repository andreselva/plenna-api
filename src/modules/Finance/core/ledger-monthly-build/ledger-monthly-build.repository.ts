import { Injectable } from '@nestjs/common';
import { LedgerMonthlyBuild } from 'src/EntityModels/ledger-monthly-build';
import { FinancialEventsEnum } from 'src/enum/financial-events.enum';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';
import BaseRepository from 'src/Shared/Repositories/BaseRepository';
import { ExpenseStatus } from '../../Expenses/Types/expense.status.type';
import { RevenueStatus } from '../../Revenues/Types/revenue.status.type';
import { EventSummaryResult, PendingItemsResult } from './types/build-result.type';

@Injectable()
export class LedgerMonthlyBuildRepository extends BaseRepository<LedgerMonthlyBuild> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext, LedgerMonthlyBuild);
    }

    async upsert(build: LedgerMonthlyBuild): Promise<void> {
        const clientId = this.authContext.getClientId();
        const query = `
            INSERT INTO ledger_monthly_builds
                (clientId, period, openChargesCount, openChargesValue, pendingExpenses, pendingRevenues, buildData, builtAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                openChargesCount = VALUES(openChargesCount),
                openChargesValue = VALUES(openChargesValue),
                pendingExpenses  = VALUES(pendingExpenses),
                pendingRevenues  = VALUES(pendingRevenues),
                buildData        = VALUES(buildData),
                builtAt          = VALUES(builtAt)
        `;
        await this.database.execute(query, [
            clientId,
            build.period,
            build.openChargesCount,
            build.openChargesValue,
            build.pendingExpenses,
            build.pendingRevenues,
            JSON.stringify(build.buildData),
            build.builtAt,
        ]);
    }

    async closePreviousPeriod(period: string, closingBalance: number): Promise<void> {
        const clientId = this.authContext.getClientId();
        const query = `
            UPDATE ledger_monthly_builds
            SET closedAt = NOW(), closingBalance = ?
            WHERE clientId = ? AND period < ? AND closedAt IS NULL
        `;
        await this.database.execute(query, [closingBalance, clientId, period]);
    }

    async getByPeriod(period: string): Promise<LedgerMonthlyBuild | null> {
        const query = `
            SELECT * FROM ledger_monthly_builds
            WHERE clientId = ? AND period = ?
            LIMIT 1
        `;
        const rows = await this.database.select(query, [this.authContext.getClientId(), period]);
        if (rows.length === 0) return null;
        return this.extractToEntity(rows)[0];
    }

    async getEventSummaryForPeriod(
        eventType: FinancialEventsEnum,
        periodStart: string,
        periodEnd: string,
    ): Promise<EventSummaryResult> {
        const clientId = this.authContext.getClientId();
        const query = `
            SELECT COUNT(*) AS count,
                   COALESCE(SUM(amount), 0) AS totalAmount
            FROM financial_events
            WHERE clientId = ? AND type = ? AND occurredAt BETWEEN ? AND ?
        `;
        const rows = await this.database.select(query, [clientId, eventType, periodStart, periodEnd]);
        return {
            count: Number(rows[0]?.count ?? 0),
            totalAmount: Number(rows[0]?.totalAmount ?? 0),
        };
    }

    async getPendingExpenses(): Promise<PendingItemsResult> {
        const clientId = this.authContext.getClientId();
        const query = `
            SELECT COUNT(*) AS count,
                   COALESCE(SUM(value), 0) AS totalValue
            FROM expense
            WHERE clientId = ? AND status IN (?, ?)
        `;
        const rows = await this.database.select(query, [clientId, ExpenseStatus.PENDING, ExpenseStatus.PARTIAL]);
        return {
            count: Number(rows[0]?.count ?? 0),
            totalValue: Number(rows[0]?.totalValue ?? 0),
        };
    }

    async getPendingRevenues(): Promise<PendingItemsResult> {
        const clientId = this.authContext.getClientId();
        const query = `
            SELECT COUNT(*) AS count,
                   COALESCE(SUM(value), 0) AS totalValue
            FROM revenue
            WHERE clientId = ? AND status IN (?, ?)
        `;
        const rows = await this.database.select(query, [clientId, RevenueStatus.PENDING, RevenueStatus.PARTIAL]);
        return {
            count: Number(rows[0]?.count ?? 0),
            totalValue: Number(rows[0]?.totalValue ?? 0),
        };
    }

    async getOpenChargesSnapshot(): Promise<{ openChargesCount: number; openChargesValue: number }> {
        const clientId = this.authContext.getClientId();
        const query = `
            SELECT
                GREATEST(0,
                    SUM(CASE WHEN type = 'CHARGE_GENERATED' THEN 1 ELSE 0 END) -
                    SUM(CASE WHEN type IN ('CHARGE_PAID','CHARGE_CANCELED','CHARGE_EXPIRED') THEN 1 ELSE 0 END)
                ) AS openChargesCount,
                GREATEST(0,
                    SUM(CASE WHEN type = 'CHARGE_GENERATED' THEN amount ELSE 0 END) -
                    SUM(CASE WHEN type IN ('CHARGE_PAID','CHARGE_CANCELED','CHARGE_EXPIRED') THEN amount ELSE 0 END)
                ) AS openChargesValue
            FROM financial_events
            WHERE clientId = ?
        `;
        const rows = await this.database.select(query, [clientId]);
        return {
            openChargesCount: Number(rows[0]?.openChargesCount ?? 0),
            openChargesValue: Number(rows[0]?.openChargesValue ?? 0),
        };
    }

    async getCurrentLiquidBalance(): Promise<number> {
        const clientId = this.authContext.getClientId();
        const query = `
            SELECT COALESCE(SUM(balance), 0) AS totalBalance
            FROM ledger_snapshots ls
            WHERE clientId = ?
              AND id = (
                  SELECT MAX(id) FROM ledger_snapshots
                  WHERE clientId = ls.clientId AND accountId = ls.accountId
              )
        `;
        const rows = await this.database.select(query, [clientId]);
        return Number(rows[0]?.totalBalance ?? 0);
    }

    async getActiveClientIds(): Promise<number[]> {
        const query = `SELECT id FROM clients WHERE status = 'active' AND clientName <> '__PLENNA_SAAS__'`;
        const rows = await this.database.select(query, []);
        return rows.map((row: any) => Number(row.id));
    }
}
