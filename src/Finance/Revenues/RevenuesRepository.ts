import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import Revenue from "./Entity/Revenue";
import { Injectable } from "@nestjs/common";
import { RevenueRowDTO } from "./DTOs/RevenueRowDTO";
import { RevenueResponseDTO } from "./DTOs/RevenueResponseDTO";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import DateHelper from "src/Shared/Utils/DateHelper";
import { RevenueDTO } from "./DTOs/RevenueDTO";

@Injectable()
export default class RevenuesRepository {
    constructor(
        private readonly database: MySQLDatabase,
    ) { }

    async getRevenues(periodo: PeriodoDTO): Promise<Revenue[]> {
        const query = "SELECT * FROM revenue WHERE invoiceDueDate >= ? AND invoiceDueDate <= ?";
        const rows = await this.database.select(query, [periodo.start, periodo.end]) as RevenueDTO[];
        return rows.map(row => new Revenue(row));
    }

    async createRevenue(revenue: Revenue): Promise<Revenue> {
        const query = "INSERT INTO revenue (name, description, value, invoiceDueDate, idCategory, installments, typeOfInstallments, sourceAccountId, hasInstallments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const params = [
            revenue.getName(),
            revenue.getDescription(),
            revenue.getValue(),
            revenue.getInvoiceDueDate(),
            revenue.getIdCategory(),
            revenue.getInstallments(),
            revenue.getTypeOfInstallments(),
            revenue.getSourceAccountId(),
            revenue.getHasInstallments()
        ];
        const result = await this.database.execute(query, params);

        if (result.affectedRows > 0) {
            revenue.setId(result.insertId);
            return revenue;
        }

        throw new Error("Failed to create revenue");
    }

    async deleteRevenue(id: number) {
        const query = "DELETE FROM revenue WHERE id = ?";
        const result = await this.database.execute(query, [id]);

        if (result.affectedRows > 0) {
            return { isSuccess: true, message: 'Revenue deleted successfully' };
        }
        throw new Error('Failed to delete revenue');
    }

    async updateRevenue(revenue: Revenue): Promise<Revenue> {
        const query = "UPDATE revenue SET name = ?, description = ?, value = ?, invoiceDueDate = ?, idCategory = ? WHERE id = ?";
        const result = await this.database.execute(
            query,
            [
                revenue.getName(),
                revenue.getDescription(),
                revenue.getValue(),
                revenue.getInvoiceDueDate(),
                revenue.getIdCategory(),
                revenue.getId()
            ]
        )

        if (result.affectedRows > 0) {
            return new Revenue(revenue);
        }
        throw new Error('Failed to update revenue');
    }

    async searchForRelatedInstallments(consideredId: number, revenueId: number = 0): Promise<Revenue[]> {
        let query = "SELECT * FROM revenue WHERE (sourceAccountId = ? OR id = ?)";
        const params = [consideredId, consideredId];

        if (revenueId > 0) {
            query += " AND id >= ?";
            params.push(revenueId);
        }

        query += " ORDER BY id ASC";
    
        const rows = await this.database.select(query, params) as RevenueDTO[];
        return rows.map(row => new Revenue(row));
    }
}