import { Injectable } from "@nestjs/common";
import MySQLDatabase from "../Config/Database/MySQLDatabase";
import { AuthContextService } from "../Auth/auth-context.service";
import DataMapper from "src/Shared/mapper/DataMapper";
import Category from "src/EntityModels/Category";
import { Expense } from "src/EntityModels/Expense";
import Revenue from "src/EntityModels/Revenue";

@Injectable()
export default class ReportsRepository {
    constructor(
        private readonly database: MySQLDatabase,
        private readonly authContext: AuthContextService
    ) {
    }

    async getCategories() {
        const clientId = this.authContext.getClientId();
        const query = 'SELECT * FROM category WHERE clientId = ?';
        const rows = await this.database.select(query, [clientId]);
        return DataMapper.toEntities(rows, Category);
    }

    async getExpenses(initialDate: string, endDate: string) {
        const clientId = this.authContext.getClientId();
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
                            WHEN 8 THEN 'Ago'
                            WHEN 9 THEN 'Set'
                            WHEN 10 THEN 'Out'
                            WHEN 11 THEN 'Nov'
                            WHEN 12 THEN 'Dez'
                        END AS month
                    FROM
                        expense
                    WHERE clientId = ?
                        AND invoiceDueDate BETWEEN ? AND ?
                    GROUP BY month
                    ORDER BY month ASC`;
        return await this.database.select(query, [clientId, initialDate, endDate]);
    }

    async getRevenues(initialDate: string, endDate: string) {
        const clientId = this.authContext.getClientId();
        const query = `SELECT * FROM revenue WHERE clientId = ? AND invoiceDueDate >= ? AND invoiceDueDate <= ?`;
        const rows = await this.database.select(query, [clientId, initialDate, endDate]);
        return DataMapper.toEntities(rows, Revenue);
    }
    
}