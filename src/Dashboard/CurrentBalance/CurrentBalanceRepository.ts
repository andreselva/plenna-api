import { Injectable } from "@nestjs/common";
import MySQLDatabase from "src/Config/Database/MySQLDatabase";

@Injectable()
export class CurrentBalanceRepository {
    constructor(
        private readonly database: MySQLDatabase,
    ) { }

    async getSumAllRevenues(): Promise<number> {
        const query = "SELECT SUM(value) as total FROM revenue";
        const [row] = await this.database.select(query);
        return row.total ?? 0;
    }

    async getSumAllExpenses(): Promise<number> {
        const query = "SELECT SUM(value) as total FROM expense";
        const [row] = await this.database.select(query);
        return row.total ?? 0;
    }
}