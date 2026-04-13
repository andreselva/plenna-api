import { Injectable } from '@nestjs/common';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';
import { EventBuilderResult } from '../../ledger-build/types/builder-result.type';

@Injectable()
export class MonthlyEventBuilder {
    constructor(
        private readonly database: MySQLDatabase,
        private readonly authContext: AuthContextService,
    ) {}

    async build(eventType: string, periodStart: string, periodEnd: string): Promise<EventBuilderResult> {
        const query = `
            SELECT COUNT(*) AS count,
                   COALESCE(SUM(amount), 0) AS totalAmount
            FROM financial_events
            WHERE clientId = ? AND type = ? AND occurredAt BETWEEN ? AND ?
        `;
        const rows = await this.database.select(query, [
            this.authContext.getClientId(),
            eventType,
            periodStart,
            periodEnd,
        ]);
        return {
            count: Number(rows[0]?.count ?? 0),
            totalAmount: Number(rows[0]?.totalAmount ?? 0),
        };
    }
}
