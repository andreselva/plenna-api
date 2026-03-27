import { Injectable } from "@nestjs/common";
import { Charge } from "src/EntityModels/Charge";
import { Expense } from "src/EntityModels/Expense";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import DataMapper from "src/Shared/mapper/DataMapper";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export class ChargesRepository extends BaseRepository<Charge> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext);
    }

    async loadExpense(expenseId: number): Promise<Expense> {
        const query = `SELECT * FROM expense WHERE id = ? AND clientId = ?`;
        const result = await this.database.select(query, [expenseId, this.authContext.getClientId()]);
        return DataMapper.toEntities(result, Expense)[0];
    }
}