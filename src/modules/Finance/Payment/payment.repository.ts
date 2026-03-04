import { Injectable } from "@nestjs/common";
import ReversePaymentDataDTO from "./DTOs/ReversePaymentDataDTO";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import Payment from "src/EntityModels/Payment";

@Injectable()
export class PaymentRepository extends BaseRepository<Payment> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext);
    }
    
    async savePayment(payment: Payment) {
        payment.clientId = this.authContext.getClientId();
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
                            id as id,
                            reversed
                        FROM payment WHERE clientId = ? AND payable_id = ? AND payable_type = ?`;
        const values = [this.authContext.getClientId(), entityId, entityType];
        const results = await this.database.select(query, values);
        return this.extractToEntity(results, Payment);
    }
}