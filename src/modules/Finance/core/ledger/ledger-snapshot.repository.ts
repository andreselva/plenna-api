import { Injectable } from '@nestjs/common';
import { LedgerSnapshot } from 'src/EntityModels/ledger-snapshot';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';
import BaseRepository from 'src/Shared/Repositories/BaseRepository';

@Injectable()
export class LedgerSnapshotRepository extends BaseRepository<LedgerSnapshot> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext, LedgerSnapshot);
    }

    async getLatestSnapshot(accountId: number): Promise<LedgerSnapshot | null> {
        const query = `
            SELECT * FROM ledger_snapshots
            WHERE clientId = ? AND accountId = ?
            ORDER BY lastSequenceNumber DESC
            LIMIT 1
        `;
        const rows = await this.database.select(query, [this.authContext.getClientId(), accountId]);
        if (rows.length === 0) return null;
        return this.extractToEntity(rows)[0];
    }

    async computeBalanceDelta(accountId: number, afterEventId: number | null): Promise<number> {
        let query = `
            SELECT COALESCE(SUM(amount), 0) AS delta
            FROM ledger_entries
            WHERE clientId = ? AND accountId = ? AND liquidity = 1
        `;
        const values: (number | null)[] = [this.authContext.getClientId(), accountId];

        if (afterEventId !== null) {
            query += ` AND eventId > ?`;
            values.push(afterEventId);
        }

        const rows = await this.database.select(query, values);
        return Number(rows[0]?.delta ?? 0);
    }

    async getAccountIds(): Promise<number[]> {
        const query = `
            SELECT DISTINCT accountId
            FROM ledger_entries
            WHERE clientId = ?
        `;
        const rows = await this.database.select(query, [this.authContext.getClientId()]);
        return rows.map((row: any) => Number(row.accountId));
    }

    async getLastEventForAccount(accountId: number): Promise<{ id: number; sequenceNumber: number; eventHash: string } | null> {
        const query = `
            SELECT id, sequenceNumber, eventHash
            FROM financial_events
            WHERE clientId = ? AND accountId = ?
            ORDER BY sequenceNumber DESC
            LIMIT 1
        `;
        const rows = await this.database.select(query, [this.authContext.getClientId(), accountId]);
        if (rows.length === 0) return null;
        return {
            id: Number(rows[0].id),
            sequenceNumber: Number(rows[0].sequenceNumber),
            eventHash: String(rows[0].eventHash),
        };
    }

    async countEventsSince(accountId: number, afterEventId: number | null): Promise<number> {
        let query = `
            SELECT COUNT(*) AS total
            FROM financial_events
            WHERE clientId = ? AND accountId = ?
        `;
        const values: (number | null)[] = [this.authContext.getClientId(), accountId];

        if (afterEventId !== null) {
            query += ` AND id > ?`;
            values.push(afterEventId);
        }

        const rows = await this.database.select(query, values);
        return Number(rows[0]?.total ?? 0);
    }

    async getAllActiveClientIds(): Promise<number[]> {
        const query = `SELECT id FROM clients WHERE status = 'active'`;
        const rows = await this.database.select(query, []);
        return rows.map((row: any) => Number(row.id));
    }
}
