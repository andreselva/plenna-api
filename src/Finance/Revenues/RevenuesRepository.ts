import { Injectable } from "@nestjs/common";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import Revenue from "src/EntityModels/Revenue";
import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import { AuthContextService } from "src/Auth/auth-context.service";

@Injectable()
export default class RevenuesRepository extends BaseRepository<Revenue> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext);
    }   
    
    async getRevenues(periodo: PeriodoDTO): Promise<Revenue[]> {
        const query = "SELECT * FROM revenue WHERE clientId = ? AND invoiceDueDate >= ? AND invoiceDueDate <= ?";
        const rows = await this.database.select(query, [this.authContext.getClientId(), periodo.start, periodo.end]);
        return this.extractToEntity(rows, Revenue);
    }

    async saveRevenue(revenue: Revenue): Promise<Revenue> {
        revenue.clientId = this.authContext.getClientId();
        const result = await this.save(revenue);
        if (result.affectedRows > 0 && revenue.id === 0) {
            revenue.id = result.insertId;
            return revenue;
        }
        return revenue;

    }

    async deleteRevenue(id: number) {
        const query = "DELETE FROM revenue WHERE clientId = ? AND id = ?";
        const result = await this.database.execute(query, [this.authContext.getClientId(), id]);

        if (result.affectedRows > 0) {
            return { isSuccess: true, message: 'Revenue deleted successfully' };
        }
        throw new Error('Failed to delete revenue');
    }

    async searchForRelatedInstallments(consideredId: number, revenueId: number = 0): Promise<Revenue[]> {
        let query = "SELECT * FROM revenue WHERE clientId = ? AND (sourceAccountId = ? OR id = ?)";
        const params = [this.authContext.getClientId(), consideredId, consideredId];

        if (revenueId > 0) {
            query += " AND id >= ?";
            params.push(revenueId);
        }

        query += " ORDER BY id ASC";
    
        const rows = await this.database.select(query, params);
        return this.extractToEntity(rows, Revenue);
    }
}