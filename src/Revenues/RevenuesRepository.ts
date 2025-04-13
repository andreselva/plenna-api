import MySQLDatabase from "src/Database/MySQLDatabase";
import Revenue from "./Entity/Revenue";
import { Injectable } from "@nestjs/common";
import { RevenueRowDTO } from "./DTOs/RevenueRowDTO";
import { CreateRevenueResponseDTO } from "./DTOs/CreateRevenueResponseDTO";

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
            row.id,
        ));
    }

    async createRevenue(revenue: Revenue): Promise<CreateRevenueResponseDTO> {
        const query = "INSERT INTO revenue (name, description, value, invoiceDueDate, idCategory) VALUES (?, ?, ?, ?, ?)";
        const params = [revenue.getName(), revenue.getDescription(), revenue.getValue(), revenue.getInvoiceDueDate(), revenue.getIdCategory()];
        const result = await this.database.execute(query, params);
    
        if (result.affectedRows > 0) {
            return new CreateRevenueResponseDTO(
                result.insertId,
                revenue.getName(),
                revenue.getDescription(),
                revenue.getValue(),
                revenue.getInvoiceDueDate(),
                revenue.getIdCategory(),
            );  
        }
    
        throw new Error("Failed to create revenue");
    }
}