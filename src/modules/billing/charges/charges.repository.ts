import { Injectable } from "@nestjs/common";
import { Charge } from "src/EntityModels/Charge";
import { ChargeEvent } from "src/EntityModels/ChargeEvent";
import { ChargeProcessing } from "src/EntityModels/ChargeProcessing";
import { Customer } from "src/EntityModels/Customer";
import { Expense } from "src/EntityModels/Expense";
import Revenue from "src/EntityModels/Revenue";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import DataMapper from "src/Shared/mapper/DataMapper";
import QueryBuilder from "src/Shared/QueryBuilder/QueryBuilder";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export class ChargesRepository extends BaseRepository<Charge> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext, Charge);
    }

    async loadRevenue(revenueId: number, applyForUpdate: boolean): Promise<Revenue> {
        const query = applyForUpdate 
            ? `SELECT * FROM revenue WHERE id = ? AND clientId = ? FOR UPDATE` 
            : `SELECT * FROM revenue WHERE id = ? AND clientId = ?`;
        const result = await this.database.select(query, [revenueId, this.authContext.getClientId()]);
        return DataMapper.toEntities(result, Revenue)[0];
    }

    async loadCustomer(customerId: number): Promise<Customer> {
        const query = `SELECT * FROM customer WHERE id = ? AND clientId = ?`;
        const result = await this.database.select(query, [customerId, this.authContext.getClientId()]);
        return DataMapper.toEntities(result, Customer)[0];
    }

    async saveProcessing(processing: ChargeProcessing): Promise<void> {
        const { sql, values } = QueryBuilder.buildQuery(processing, processing.getTableName(), processing.getPrimaryKey(), processing.getIgnoredProperties());
        await this.database.execute(sql, values);
    }
}
