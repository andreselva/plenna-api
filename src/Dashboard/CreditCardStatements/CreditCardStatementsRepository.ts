import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import CreditCardStatementsDTO from "./DTOs/CreditCardStatementsDTO";
import { Injectable } from "@nestjs/common";

@Injectable()
export default class CreditCardStatementsRepository {
    constructor(
        private readonly database: MySQLDatabase
    ) { }

    async getExpenses(): Promise<CreditCardStatementsDTO[]> {
        const query = `SELECT 
                            SUM(e.value) AS value, ba.name AS card
                        FROM
                            expense e
                                JOIN
                            bank_account ba ON ba.id = e.idCreditCard
                        GROUP BY 2
                        ORDER BY value DESC`;
        const rows = await this.database.select(query) as CreditCardStatementsDTO[];
        return rows.map(row => new CreditCardStatementsDTO(row.value, row.card));
    }
}