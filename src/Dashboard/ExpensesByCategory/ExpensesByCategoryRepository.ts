import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import { ExpensesByCategoryDTO } from "./DTOs/ExpensesByCategoryRowDTO";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ExpensesByCategoryRepository {
    constructor(
        private readonly database: MySQLDatabase,
    ) { }

    async getTotalExpenses(): Promise<ExpensesByCategoryDTO[]> {
        const query = `SELECT 
                            c.name, SUM(e.value) AS value
                        FROM
                            expense e
                                JOIN
                            category c ON c.id = e.idCategory
                        GROUP BY 1
                        ORDER BY value DESC
                        LIMIT 5`;
        const result = await this.database.select(query);

        return result.map((item: any): ExpensesByCategoryDTO => ({
            name: item.name,
            value: Number(item.value)
        }));
    }
}