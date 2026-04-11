import { Injectable } from "@nestjs/common";
import { FinancialEvents } from "src/EntityModels/FinancialEvent";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import { TransactionContext } from "src/modules/Config/Database/transaction-context";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import { FinancialEventOutsideTransactionException } from "./exceptions/financial-event-outside-transaction.exception";

@Injectable()
export class FinancialEventsRepository extends BaseRepository<FinancialEvents>{
    constructor(
        database: MySQLDatabase,
        authContext: AuthContextService,
        private readonly transactionContext: TransactionContext,
    ) {
        super(database, authContext, FinancialEvents)
    }

    async saveEvent(financialEvent: FinancialEvents): Promise<FinancialEvents> {
        const result = await this.save(financialEvent);
        if (result.affectedRows > 0) {
            financialEvent.id = result.insertId;
        }
        return financialEvent;
    }

    async getLastEvent(): Promise<FinancialEvents | null> {
        if (!this.transactionContext.hasTransaction()) {
            throw new FinancialEventOutsideTransactionException(`getLastEvent must be called within a transaction`);
        }
        const query = `SELECT * FROM financial_events WHERE clientId = ? ORDER BY id DESC LIMIT 1 FOR UPDATE`;
        const result = await this.database.select(query, [this.authContext.getClientId()]);
        if (result !== null && result !== undefined && result.length === 1) {
            return this.extractToEntity(result)[0];
        }
        return null;
    }
}