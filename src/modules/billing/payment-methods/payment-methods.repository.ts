import { PaymentMethod } from "src/EntityModels/PaymentMethod";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PaymentMethodsRepository extends BaseRepository<PaymentMethod>{
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext, PaymentMethod);
    }

    async getPaymentMethods(): Promise<PaymentMethod[]> {
        return await this.loadAll();
    }

    async getPaymentMethodByClient(): Promise<PaymentMethod[]> {
        const query = `SELECT * FROM payment_method pm
                       JOIN payment_method_client pmc ON pm.id = pmc.paymentMethodId
                       WHERE pmc.clientId = ?`;
        const result = await this.database.select(query, [this.authContext.getClientId()]);
        return this.extractToEntity(result);
    }

    async updatePaymentMethodForClient(paymentMethodId: number, enabled: boolean): Promise<void> {
        const query = `DELETE FROM payment_method_client WHERE clientId = ? AND paymentMethodId = ?`;
        await this.database.execute(query, [this.authContext.getClientId(), paymentMethodId]);
        if (enabled) {
            const insertQuery = `INSERT INTO payment_method_client (clientId, paymentMethodId, enabled) VALUES (?, ?, ?)`;
            await this.database.execute(insertQuery, [this.authContext.getClientId(), paymentMethodId, enabled]);
        }
    }
}
