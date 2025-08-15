import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import CreditCardStatementsDTO from "./DTOs/CreditCardStatementsDTO";
import { Injectable } from "@nestjs/common";
import DashboardArgs from "../Args/DashboardArgs";

@Injectable()
export default class CreditCardStatementsRepository {
    constructor(
        private readonly database: MySQLDatabase
    ) { }

    //Atualmente em desuso, pois o serviço de faturas já retorna as despesas relacionadas
    async getExpenses(args: DashboardArgs): Promise<CreditCardStatementsDTO[]> {
        const query = `SELECT 
                            SUM(e.value) AS value, ba.name AS card
                        FROM
                            expense e
                                JOIN
                            bank_account ba ON ba.id = e.idCreditCard
                            WHERE e.invoiceDueDate >= ? AND e.invoiceDueDate <= ?
                        GROUP BY 2
                        ORDER BY value DESC`;
        const rows = await this.database.select(query, [args.startDate, args.endDate]) as CreditCardStatementsDTO[];
        return rows.map(row => new CreditCardStatementsDTO(row.value, row.card));
    }
}