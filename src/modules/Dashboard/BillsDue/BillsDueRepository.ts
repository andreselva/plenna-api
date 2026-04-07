import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import { BillsDueDTO } from "./DTOs/BillsDueDTO";
import { ExpenseRowDTO } from "./DTOs/ExpenseRowDTO";
import { Injectable } from "@nestjs/common";
import DashboardArgs from "../Args/DashboardArgs";
import DateHelper from "src/Shared/Utils/DateHelper";
import { AuthContextService } from "src/modules/Auth/auth-context.service";

@Injectable()
export class BillsDueRepository {
    constructor(
        private readonly database: MySQLDatabase,
        private readonly authContext: AuthContextService
    ) { }

    async getBills(args: DashboardArgs): Promise<BillsDueDTO[]> {
        const query = `SELECT 
                            name, invoiceDueDate, value
                        FROM
                            expense
                        WHERE clientId = ?
                        AND invoiceDueDate >= ? AND invoiceDueDate <= ?
                        AND (idCreditCard <= 0 OR idCreditCard is null OR idCreditCard = "")
                        AND status NOT IN ('cancelled', 'reversed', 'archived')
                        ORDER BY invoiceDueDate`;
        const rows = await this.database.select(query, [this.authContext.getClientId(), args.startDate, args.endDate]) as ExpenseRowDTO[];

        return rows.map((row) => new BillsDueDTO(
            row.name,
            DateHelper.toISODate(row.invoiceDueDate) as string,
            row.value
        ));
    }
}