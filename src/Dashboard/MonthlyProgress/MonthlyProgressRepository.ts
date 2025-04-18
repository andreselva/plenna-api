import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import MonthlyProgressRowDTO from "./DTOs/MonthlyProgressRowDTO";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MonthlyProgressRepository {
    constructor(
        private readonly database: MySQLDatabase,
    ) { }

    async getExpensesData(startDate: string, endDate: string) {
        const query = `SELECT 
                        SUM(value) AS value,
                        CASE MONTH(invoiceDueDate)
                            WHEN 1 THEN 'Jan'
                            WHEN 2 THEN 'Fev'
                            WHEN 3 THEN 'Mar'
                            WHEN 4 THEN 'Abr'
                            WHEN 5 THEN 'Maio'
                            WHEN 6 THEN 'Jun'
                            WHEN 7 THEN 'Jul'
                            WHEN 8 THEN 'Aug'
                            WHEN 9 THEN 'Set'
                            WHEN 10 THEN 'Out'
                            WHEN 11 THEN 'Nov'
                            WHEN 12 THEN 'Dez'
                        END AS month
                    FROM
                        expense
                    WHERE
                        invoiceDueDate BETWEEN ? AND ?
                    GROUP BY invoiceDueDate
                    ORDER BY invoiceDueDate ASC`;
        const rows = await this.database.select(query, [startDate, endDate]) as MonthlyProgressRowDTO[];

        return rows.map(row => new MonthlyProgressRowDTO(
            row.value,
            row.month
        ))
    }

    async getRevenuesData(startDate: string, endDate: string) {
        const query = `SELECT 
                        SUM(value) AS value,
                        CASE MONTH(invoiceDueDate)
                            WHEN 1 THEN 'Jan'
                            WHEN 2 THEN 'Fev'
                            WHEN 3 THEN 'Mar'
                            WHEN 4 THEN 'Abr'
                            WHEN 5 THEN 'Maio'
                            WHEN 6 THEN 'Jun'
                            WHEN 7 THEN 'Jul'
                            WHEN 8 THEN 'Aug'
                            WHEN 9 THEN 'Set'
                            WHEN 10 THEN 'Out'
                            WHEN 11 THEN 'Nov'
                            WHEN 12 THEN 'Dez'
                        END AS month
                    FROM
                        revenue
                    WHERE
                        invoiceDueDate BETWEEN ? AND ?
                    GROUP BY invoiceDueDate
                    ORDER BY invoiceDueDate ASC`;
        const rows = await this.database.select(query, [startDate, endDate]) as MonthlyProgressRowDTO[];
        return rows.map(row => new MonthlyProgressRowDTO(
            row.value,
            row.month
        ));
    }
}