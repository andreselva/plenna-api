import { Injectable } from "@nestjs/common";
import Payment from "./Entity/Payment";
import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import PaymentInicialDataDTO from "./DTOs/PaymentInicialDataDTO";
import ReversePaymentDataDTO from "./DTOs/ReversePaymentDataDTO";

@Injectable()
export class PaymentRepository {
    constructor(
        private readonly database: MySQLDatabase
    ) { }

    async save(payment: Payment) {
        try {
            const query = "INSERT INTO payment (value, payment_date, payable_id, payable_type) VALUES (?, ?, ?, ?)";
            const values = [payment.getValue(), payment.getPaymentDate(), payment.getPayableId(), payment.getPayableType()];
            const result = await this.database.execute(query, values);
            if (result && result.insertId > 0) {
                payment.setId(result.insertId);
                return payment;
            }
        } catch (error) {
            console.error("Error saving payment:", error);
            throw new Error("Failed to save payment");
        }
    }

    async getPaymentsByEntity(entityType: string, entityId: string) {
        try {
            const query = `SELECT 
                                value as value,
                                payment_date as paymentDate,
                                payable_id as payableId,
                                payable_type as payableType,
                                id as id
                            FROM payment WHERE payable_type = ? AND payable_id = ?`;
            const values = [entityType, entityId];
            const results = await this.database.select(query, values) as PaymentInicialDataDTO[];
            return results.map(row => new Payment(row));
        } catch (error) {
            console.error("Error fetching payments:", error);
            throw new Error("Failed to fetch payments");
        }
    }

    async deletePayment(dto: ReversePaymentDataDTO) {
        try {
            const query = "DELETE FROM payment WHERE id = ? AND payable_type = ? AND payable_id = ?";
            const values = [dto.paymentId, dto.entityType, dto.entityId];
            const result = await this.database.execute(query, values);
            if (result && result.affectedRows > 0) {
                return true;
            } else {
                throw new Error("Payment not found or already deleted");
            }
        } catch (error) {
            throw new Error(`Failed to delete payment. Error: ${error.message}`);
        }
    }
}