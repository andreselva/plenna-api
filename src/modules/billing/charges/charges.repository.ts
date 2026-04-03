import { Injectable } from "@nestjs/common";
import { Charge } from "src/EntityModels/Charge";
import { Customer } from "src/EntityModels/Customer";
import { Expense } from "src/EntityModels/Expense";
import Revenue from "src/EntityModels/Revenue";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import DataMapper from "src/Shared/mapper/DataMapper";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export class ChargesRepository extends BaseRepository<Charge> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext, Charge);
    }

    async loadRevenue(revenueId: number): Promise<Revenue> {
        const query = `SELECT * FROM revenue WHERE id = ? AND clientId = ?`;
        const result = await this.database.select(query, [revenueId, this.authContext.getClientId()]);
        return DataMapper.toEntities(result, Revenue)[0];
    }

    async loadCustomer(customerId: number): Promise<Customer> {
        const query = `SELECT * FROM customer WHERE id = ? AND clientId = ?`;
        const result = await this.database.select(query, [customerId, this.authContext.getClientId()]);
        return DataMapper.toEntities(result, Customer)[0];
    }
}
