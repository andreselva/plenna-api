import { Injectable } from "@nestjs/common";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import DashboardArgs from "../Args/DashboardArgs";
import { AuthContextService } from "src/modules/Auth/auth-context.service";

@Injectable()
export class CurrentBalanceRepository {
    constructor(
        private readonly database: MySQLDatabase,
        private readonly authContext: AuthContextService
    ) { }

    async getSumAllRevenues(args: DashboardArgs): Promise<number> {
        const query = "SELECT SUM(value) as total FROM revenue WHERE invoiceDueDate >= ? AND invoiceDueDate <= ? AND clientId = ?";
        const [row] = await this.database.select(query, [args.startDate, args.endDate, this.authContext.getClientId()]);
        return row.total ?? 0;
    }

    async getSumAllExpenses(args: DashboardArgs): Promise<number> {
        const query = "SELECT SUM(value) as total FROM expense WHERE invoiceDueDate >= ? AND invoiceDueDate <= ? AND clientId = ?";
        const [row] = await this.database.select(query, [args.startDate, args.endDate, this.authContext.getClientId()]);
        return row.total ?? 0;
    }
}