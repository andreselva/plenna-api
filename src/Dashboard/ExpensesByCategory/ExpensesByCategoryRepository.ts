import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import { ExpensesByCategoryDTO } from "./DTOs/ExpensesByCategoryRowDTO";
import { Injectable } from "@nestjs/common";
import DashboardArgs from "../Args/DashboardArgs";
import { AuthContextService } from "src/Auth/auth-context.service";

@Injectable()
export class ExpensesByCategoryRepository {
    constructor(
        private readonly database: MySQLDatabase,
        private readonly authContext: AuthContextService
    ) { }

    async getTotalExpenses(args: DashboardArgs): Promise<ExpensesByCategoryDTO[]> {
        const query = `SELECT 
                            c.name, SUM(e.value) AS value
                        FROM
                            expense e
                                JOIN
                            category c ON c.id = e.idCategory AND c.clientId = e.clientId
                            WHERE e.invoiceDueDate >= ? AND e.invoiceDueDate <= ?
                            AND e.clientId = ?
                        GROUP BY 1
                        ORDER BY value DESC
                        LIMIT 5`;
        const result = await this.database.select(query, [args.startDate, args.endDate, this.authContext.getClientId()]);

        return result.map((item: any): ExpensesByCategoryDTO => ({
            name: item.name,
            value: Number(item.value)
        }));
    }
}