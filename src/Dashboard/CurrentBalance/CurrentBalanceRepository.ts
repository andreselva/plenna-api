import { Injectable } from "@nestjs/common";
import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import DashboardArgs from "../Args/DashboardArgs";

@Injectable()
export class CurrentBalanceRepository {
    constructor(
        private readonly database: MySQLDatabase,
    ) { }

    async getSumAllRevenues(args: DashboardArgs): Promise<number> {
        const query = "SELECT SUM(value) as total FROM revenue WHERE invoiceDueDate >= ? AND invoiceDueDate <= ?";
        const [row] = await this.database.select(query, [args.startDate, args.endDate]);
        return row.total ?? 0;
    }

    async getSumAllExpenses(args: DashboardArgs): Promise<number> {
        const query = "SELECT SUM(value) as total FROM expense WHERE invoiceDueDate >= ? AND invoiceDueDate <= ?";
        const [row] = await this.database.select(query, [args.startDate, args.endDate]);
        return row.total ?? 0;
    }
}