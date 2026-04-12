import { Injectable } from '@nestjs/common';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';
import { EventBuilderResult } from '../types/builder-result.type';

@Injectable()
export class ReversalBuilder {
    constructor(
        private readonly database: MySQLDatabase,
        private readonly authContext: AuthContextService,
    ) {}

    async build(): Promise<EventBuilderResult> {
        const query = `
            SELECT COUNT(*) AS count,
                   COALESCE(SUM(amount), 0) AS totalAmount
            FROM financial_events
            WHERE clientId = ? AND type = 'REVERSAL'
        `;
        const rows = await this.database.select(query, [this.authContext.getClientId()]);
        return { count: Number(rows[0].count), totalAmount: Number(rows[0].totalAmount) };
    }
}
