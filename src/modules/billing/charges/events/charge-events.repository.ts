import { ChargeEvent } from "src/EntityModels/ChargeEvent";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import { Injectable } from "@nestjs/common";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";

@Injectable()
export class ChargeEventsRepository extends BaseRepository<ChargeEvent> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext, ChargeEvent);
    }

    async loadHistoryByChargeId(chargeId: number): Promise<ChargeEvent[]> {
        const query = `SELECT * FROM  charges_events WHERE chargeId = ? AND clientId = ? ORDER BY createdAt DESC`;
        const result = await this.database.select(query, [chargeId, this.authContext.getClientId()]);
        return this.extractToEntity(result);
    }
}