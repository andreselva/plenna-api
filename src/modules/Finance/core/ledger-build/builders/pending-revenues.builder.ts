import { Injectable } from '@nestjs/common';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';
import { PendingItemsResult } from '../types/builder-result.type';

@Injectable()
export class PendingRevenuesBuilder {
    constructor(
        private readonly database: MySQLDatabase,
        private readonly authContext: AuthContextService,
    ) {}

    async build(): Promise<PendingItemsResult> {
        const query = `
            SELECT COUNT(*) AS count,
                   COALESCE(SUM(value), 0) AS totalValue
            FROM revenue
            WHERE clientId = ? AND status IN ('pending', 'partial')
        `;
        const rows = await this.database.select(query, [this.authContext.getClientId()]);
        return { count: Number(rows[0].count), totalValue: Number(rows[0].totalValue) };
    }
}
