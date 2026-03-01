import { Injectable } from "@nestjs/common";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import Revenue from "src/EntityModels/Revenue";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import { RevenueStatus } from "./Types/revenue.status.type";

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

    async getRevenueById(id: number): Promise<Revenue> {
        const query = `SELECT * FROM revenue WHERE clientId = ? AND id = ?`;
        const result = await this.database.select(query, [this.authContext.getClientId(), id]);
        return this.extractToEntity(result, Revenue)[0];
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

    async getTotalPayments(id: number): Promise<number> {
        const query = `SELECT sum(value) FROM payment WHERE clientId = ? AND payable_type = 'revenue' AND payable_id = ?`;
        const result = await this.database.select(query, [this.authContext.getClientId(), id]);
        return Number(result[0]?.totalPayments) || 0;
    }

    async updateStatus(id: number, status: RevenueStatus, paymentDate: string|null) {
        const query = `UPDATE revenue SET status = ?, paymentDate = ? WHERE id = ? AND clientId = ?`;
        await this.database.execute(query, [status, paymentDate, id, this.authContext.getClientId()]);
    }
}