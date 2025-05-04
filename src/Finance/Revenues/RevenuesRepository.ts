import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import Revenue from "./Entity/Revenue";
import { Injectable } from "@nestjs/common";
import { RevenueRowDTO } from "./DTOs/RevenueRowDTO";
import { RevenueResponseDTO } from "./DTOs/RevenueResponseDTO";

@Injectable()
export default class RevenuesRepository {
    constructor(
        private readonly database: MySQLDatabase,
    ) { }

    async getRevenues(): Promise<Revenue[]> {
        const query = "SELECT * FROM revenue";
        const rows = await this.database.select(query) as RevenueRowDTO[];

        return rows.map(row => new Revenue(
            row.name,
            row.description,
            row.value,
            row.invoiceDueDate,
            row.idCategory,
            row.installments,
            row.typeOfInstallments,
            row.sourceAccountId,
            row.id,
        ));
    }

    async createRevenue(revenue: Revenue): Promise<Revenue> {
        const query = "INSERT INTO revenue (name, description, value, invoiceDueDate, idCategory, installments, typeOfInstallments, sourceAccountId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const params = [
            revenue.getName(),
            revenue.getDescription(),
            revenue.getValue(),
            revenue.getInvoiceDueDate(),
            revenue.getIdCategory(),
            revenue.getInstallments(),
            revenue.getTypeOfInstallments(),
            revenue.getSourceAccountId()
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
            return {
                message: 'Revenue deleted successfully',
            }
        }
        throw new Error('Failed to delete revenue');
    }

    async updateRevenue(revenue: Revenue): Promise<RevenueResponseDTO> {
        const query = "UPDATE revenue SET name = ?, description = ?, value = ?, invoiceDueDate = ?, idCategory = ? WHERE id = ?";
        const result = await this.database.execute(
            query,
            [revenue.getName(), revenue.getDescription(), revenue.getValue(), revenue.getInvoiceDueDate(), revenue.getIdCategory(), revenue.getId()]
        )

        if (result.affectedRows > 0) {
            return new RevenueResponseDTO(
                revenue.getId(),
                revenue.getName(),
                revenue.getDescription(),
                revenue.getValue(),
                revenue.getInvoiceDueDate(),
                revenue.getIdCategory()
            )
        }
        throw new Error('Failed to update revenue');
    }
}