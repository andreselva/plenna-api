import { Injectable } from "@nestjs/common";
import { FinancialEvents } from "src/EntityModels/FinancialEvent";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import MySQLDatabase from "../../Config/Database/MySQLDatabase";
import { AuthContextService } from "../../Auth/auth-context.service";

@Injectable()
export class FinancialEventsRepository extends BaseRepository<FinancialEvents>{
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext)
    }

    async saveEvent(financialEvent: FinancialEvents): Promise<FinancialEvents> {
        const result = await this.save(financialEvent);
        if (result.affectedRows > 0) {
            financialEvent.id = result.insertId;
        }
        return financialEvent;
    }

    async getMaxSequenceNumber(): Promise<number | null> {
        const query = `SELECT MAX(sequenceNumber) AS maxSequenceNumber
            FROM financial_events
            WHERE clientId = ?`;
        const result = await this.database.select(query, [this.authContext.getClientId()]);
        const value = result[0]?.maxSequenceNumber;
        return value !== null && value !== undefined ? Number(value) : null;
    }

    async getLastEventHash(): Promise<string | null> {
        const query = `SELECT eventHash as previousHash FROM financial_events WHERE clientId = ? ORDER BY sequenceNumber DESC LIMIT 1`;
        const result = await this.database.select(query, [this.authContext.getClientId()]);
        return result[0]?.previousHash ?? null;
    }

}