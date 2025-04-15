import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import { BillsDueDTO } from "./DTOs/BillsDueDTO";
import { ExpenseRowDTO } from "./DTOs/ExpenseRowDTO";
import { Injectable } from "@nestjs/common";

@Injectable()
export class BillsDueRepository {
    constructor(
        private readonly database: MySQLDatabase,
    ) { }

    async getBills(): Promise<BillsDueDTO[]> {
        const query = `SELECT 
                            name, invoiceDueDate, value
                        FROM
                            expense
                        ORDER BY invoiceDueDate`;
        const rows = await this.database.select(query) as ExpenseRowDTO[];

        return rows.map((row) => new BillsDueDTO(
            row.name,
            row.invoiceDueDate,
            row.value
        ));
    }
}