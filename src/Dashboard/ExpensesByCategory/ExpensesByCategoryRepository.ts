import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import { ExpensesByCategoryDTO } from "./DTOs/ExpensesByCategoryRowDTO";
import { Injectable } from "@nestjs/common";
import DashboardArgs from "../Args/DashboardArgs";

@Injectable()
export class ExpensesByCategoryRepository {
    constructor(
        private readonly database: MySQLDatabase,
    ) { }

    async getTotalExpenses(args: DashboardArgs): Promise<ExpensesByCategoryDTO[]> {
        const query = `SELECT 
                            c.name, SUM(e.value) AS value
                        FROM
                            expense e
                                JOIN
                            category c ON c.id = e.idCategory
                            WHERE e.invoiceDueDate >= ? AND e.invoiceDueDate <= ?
                        GROUP BY 1
                        ORDER BY value DESC
                        LIMIT 5`;
        const result = await this.database.select(query, [args.startDate, args.endDate]);

        return result.map((item: any): ExpensesByCategoryDTO => ({
            name: item.name,
            value: Number(item.value)
        }));
    }
}