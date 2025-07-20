import { Injectable } from "@nestjs/common";
import Payment from "./Entity/Payment";
import MySQLDatabase from "src/Config/Database/MySQLDatabase";

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
}