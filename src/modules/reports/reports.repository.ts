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
                            YEAR(invoiceDueDate) AS y,
                            MONTH(invoiceDueDate) AS m,
                            SUM(value) AS total
                        FROM expense
                            WHERE clientId = ?
                                AND invoiceDueDate >= ?
                                AND invoiceDueDate <  ?
                        GROUP BY y, m
                        ORDER BY y, m`;
        return await this.database.select(query, [clientId, initialDate, endDate]);
    }

    async getRevenues(initialDate: string, endDate: string) {
        const clientId = this.authContext.getClientId();
        const query = `SELECT 
                            YEAR(invoiceDueDate) AS y,
                            MONTH(invoiceDueDate) AS m,
                            SUM(value) AS total
                        FROM revenue
                            WHERE clientId = ?
                            AND invoiceDueDate >= ? 
                            AND invoiceDueDate < ?
                        GROUP BY y, m
                        ORDER BY y, m`;
        return await this.database.select(query, [clientId, initialDate, endDate]);
    }
    
}