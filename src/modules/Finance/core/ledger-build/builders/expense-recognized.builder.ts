import { Injectable } from '@nestjs/common';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';
import { EventBuilderResult } from '../types/builder-result.type';

@Injectable()
export class ExpenseRecognizedBuilder {
    constructor(
        private readonly database: MySQLDatabase,
        private readonly authContext: AuthContextService,
    ) {}

    async build(): Promise<EventBuilderResult> {
        const query = `
            SELECT 
                COUNT(*) AS count,
                COALESCE(SUM(fe.amount), 0) AS totalAmount
            FROM financial_events fe
            WHERE
                fe.clientId = ?
                AND fe.type = 'EXPENSE_RECOGNIZED'
                AND NOT EXISTS (
                    SELECT 1
                    FROM financial_events fe2
                    WHERE
                        fe2.clientId = fe.clientId
                        AND fe2.type = 'PAYMENT_POSTED'
                        AND fe2.referenceType = fe.referenceType
                        AND fe2.referenceId = fe.referenceId
                );`;
        const rows = await this.database.select(query, [this.authContext.getClientId()]);
        return { count: Number(rows[0].count), totalAmount: Number(rows[0].totalAmount) };
    }
}
