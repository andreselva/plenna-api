import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import Revenue from "./Entity/Revenue";
import { Injectable } from "@nestjs/common";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export default class RevenuesRepository extends BaseRepository<Revenue> {
    constructor(database: MySQLDatabase) {
        super(database);
    }

    async getRevenues(periodo: PeriodoDTO): Promise<Revenue[]> {
        const query = "SELECT * FROM revenue WHERE invoiceDueDate >= ? AND invoiceDueDate <= ?";
        const rows = await this.database.select(query, [periodo.start, periodo.end]);
        return this.extractToEntity(rows, Revenue);
    }

    async saveRevenue(revenue: Revenue): Promise<Revenue> {
        const result = await this.save(revenue);
        if (result.affectedRows > 0 && revenue.id === 0) {
            revenue.id = result.insertId;
            return revenue;
        }
        return revenue;

    }

    async deleteRevenue(id: number) {
        const query = "DELETE FROM revenue WHERE id = ?";
        const result = await this.database.execute(query, [id]);

        if (result.affectedRows > 0) {
            return { isSuccess: true, message: 'Revenue deleted successfully' };
        }
        throw new Error('Failed to delete revenue');
    }

    async searchForRelatedInstallments(consideredId: number, revenueId: number = 0): Promise<Revenue[]> {
        let query = "SELECT * FROM revenue WHERE (sourceAccountId = ? OR id = ?)";
        const params = [consideredId, consideredId];

        if (revenueId > 0) {
            query += " AND id >= ?";
            params.push(revenueId);
        }

        query += " ORDER BY id ASC";
    
        const rows = await this.database.select(query, params);
        return this.extractToEntity(rows, Revenue);
    }
}