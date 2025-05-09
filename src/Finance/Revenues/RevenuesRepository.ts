import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import Revenue from "./Entity/Revenue";
import { Injectable } from "@nestjs/common";
import { RevenueRowDTO } from "./DTOs/RevenueRowDTO";
import { RevenueResponseDTO } from "./DTOs/RevenueResponseDTO";
import { FormatDate } from "src/Shared/Utils/FormatDate";

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
            Boolean(row.hasInstallments),
            row.id,
        ));
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
            return new RevenueResponseDTO(
                revenue.getId(),
                revenue.getName(),
                revenue.getDescription(),
                revenue.getValue(),
                revenue.getInvoiceDueDate(),
                revenue.getIdCategory(),
                revenue.getInstallments(),
                revenue.getTypeOfInstallments(),
                revenue.getSourceAccountId(),
                revenue.getHasInstallments()
            )
        }
        throw new Error('Failed to update revenue');
    }

    async searchForRelatedInstallments(idInstallment: number): Promise<Revenue[]> {
        const query = "SELECT * FROM revenue WHERE (sourceAccountId = ? OR id = ?) ORDER BY id ASC";
        const rows = await this.database.select(query, [idInstallment, idInstallment]) as RevenueRowDTO[];

        return rows.map(row => new Revenue(
            String(row.name),
            String(row.description),
            Number(row.value),
            FormatDate.formatToYYYYMMDD(row.invoiceDueDate),
            Number(row.idCategory),
            Number(row.installments),
            String(row.typeOfInstallments),
            Number(row.sourceAccountId),
            Boolean(row.hasInstallments),
            Number(row.id),
        ))
    }
}