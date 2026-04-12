import { Injectable } from '@nestjs/common';
import { LedgerBuild } from 'src/EntityModels/ledger-build';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';
import BaseRepository from 'src/Shared/Repositories/BaseRepository';

@Injectable()
export class LedgerBuildRepository extends BaseRepository<LedgerBuild> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext, LedgerBuild);
    }

    async getLatestBuild(): Promise<LedgerBuild | null> {
        const query = `
            SELECT * FROM ledger_builds
            WHERE clientId = ?
            ORDER BY builtAt DESC
            LIMIT 1
        `;
        const rows = await this.database.select(query, [this.authContext.getClientId()]);
        if (rows.length === 0) return null;
        return this.extractToEntity(rows)[0];
    }

    async getAllActiveClientIds(): Promise<number[]> {
        const query = `SELECT id FROM clients WHERE status = 'active' AND clientName <> '__PLENNA_SAAS__'`;
        const rows = await this.database.select(query, []);
        return rows.map((row: any) => Number(row.id));
    }
}
