import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import { BillsDueDTO } from "./DTOs/BillsDueDTO";
import { ExpenseRowDTO } from "./DTOs/ExpenseRowDTO";
import { Injectable } from "@nestjs/common";
import DashboardArgs from "../Args/DashboardArgs";
import DateHelper from "src/Shared/Utils/DateHelper";

@Injectable()
export class BillsDueRepository {
    constructor(
        private readonly database: MySQLDatabase,
    ) { }

    async getBills(args: DashboardArgs): Promise<BillsDueDTO[]> {
        const query = `SELECT 
                            name, invoiceDueDate, value
                        FROM
                            expense
                        WHERE invoiceDueDate >= ? AND invoiceDueDate <= ?
                        AND  (idCreditCard <= 0 OR idCreditCard is null OR idCreditCard = "")
                        ORDER BY invoiceDueDate`;
        const rows = await this.database.select(query, [args.startDate, args.endDate]) as ExpenseRowDTO[];

        return rows.map((row) => new BillsDueDTO(
            row.name,
            DateHelper.toISODate(row.invoiceDueDate) as string,
            row.value
        ));
    }
}