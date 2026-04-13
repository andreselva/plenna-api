import { Injectable } from '@nestjs/common';
import { AuthContextService } from 'src/modules/Auth/auth-context.service';
import MySQLDatabase from 'src/modules/Config/Database/MySQLDatabase';
import { BankBalanceBuilderResult } from '../types/builder-result.type';

@Injectable()
export class BankBalanceBuilder {
    constructor(
        private readonly database: MySQLDatabase,
        private readonly authContext: AuthContextService,
    ) {}

    async build(): Promise<BankBalanceBuilderResult> {
        const clientId = this.authContext.getClientId();
        const query = `
            SELECT accountId, balance
            FROM ledger_snapshots ls
            WHERE clientId = ?
              AND id = (
                  SELECT MAX(id) FROM ledger_snapshots
                  WHERE clientId = ls.clientId AND accountId = ls.accountId
              )
        `;
        const rows = await this.database.select(query, [clientId]);
        const byAccount = rows.map((r: any) => ({
            accountId: Number(r.accountId),
            balance: Number(r.balance),
        }));
        const totalLiquidBalance = byAccount.reduce((sum, a) => sum + a.balance, 0);
        return { totalLiquidBalance, byAccount };
    }
}
