import { Injectable } from "@nestjs/common";
import Payment from "../../EntityModels/Payment";
import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import ReversePaymentDataDTO from "./DTOs/ReversePaymentDataDTO";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export class PaymentRepository extends BaseRepository<Payment> {
    constructor(database: MySQLDatabase) { 
        super(database);
    }

    async savePayment(payment: Payment) {
        const result = await this.save(payment);
        if (result && result.insertId > 0) {
            payment.id = result.insertId;
        }
        return payment;
    }

    async getPaymentsByEntity(entityType: string, entityId: string) {
        const query = `SELECT 
                            value as value,
                            payment_date,
                            payable_id,
                            payable_type,
                            id as id
                        FROM payment WHERE payable_type = ? AND payable_id = ?`;
        const values = [entityType, entityId];
        const results = await this.database.select(query, values);
        return this.extractToEntity(results, Payment);
    }

    async deletePayment(dto: ReversePaymentDataDTO) {
        const query = "DELETE FROM payment WHERE id = ? AND payable_type = ? AND payable_id = ?";
        const values = [dto.paymentId, dto.entityType, dto.entityId];
        await this.database.execute(query, values);
        return true;
    }
}