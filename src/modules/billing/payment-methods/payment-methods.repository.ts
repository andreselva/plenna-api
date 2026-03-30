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

    async getPaymentMethodsWithClientStatus(): Promise<Array<{ id: number; name: string; code: string; isActive: boolean }>> {
        const query = `
            SELECT
                pm.id,
                pm.name,
                LPAD(pm.code, 2, '0') AS code,
                COALESCE(pmc.enabled, FALSE) AS isActive
            FROM payment_methods pm
            LEFT JOIN payment_method_client pmc
                ON pm.id = pmc.paymentMethodId
               AND pmc.clientId = ?
            ORDER BY pm.code ASC
        `;

        const rows = await this.database.select(query, [this.authContext.getClientId()]);

        return rows.map((row: any) => ({
            id: Number(row.id),
            name: row.name,
            code: String(row.code).padStart(2, '0'),
            isActive: !!row.isActive,
        }));
    }

    async getPaymentMethodByClient(): Promise<Array<{ id: number; name: string; code: string; isActive: boolean }>> {
        const query = `
            SELECT
                pm.id,
                pm.name,
                LPAD(pm.code, 2, '0') AS code,
                pmc.enabled AS isActive
            FROM payment_methods pm
            INNER JOIN payment_method_client pmc
                ON pm.id = pmc.paymentMethodId
            WHERE pmc.clientId = ?
            ORDER BY pm.code ASC
        `;

        const result = await this.database.select(query, [this.authContext.getClientId()]);

        return result.map((row: any) => ({
            id: Number(row.id),
            name: row.name,
            code: String(row.code).padStart(2, '0'),
            isActive: !!row.isActive,
        }));
    }

    async updatePaymentMethodForClientByCode(code: string, enabled: boolean): Promise<{ id: number; name: string; code: string; isActive: boolean }> {
        const paymentMethod = await this.findPaymentMethodByCode(code);

        if (!paymentMethod) {
            throw new Error(`Payment method not found for code ${code}`);
        }

        const deleteQuery = `DELETE FROM payment_method_client WHERE clientId = ? AND paymentMethodId = ?`;
        await this.database.execute(deleteQuery, [this.authContext.getClientId(), paymentMethod.id]);

        if (enabled) {
            const insertQuery = `INSERT INTO payment_method_client (clientId, paymentMethodId, enabled) VALUES (?, ?, ?)`;
            await this.database.execute(insertQuery, [this.authContext.getClientId(), paymentMethod.id, true]);
        }

        return {
            id: paymentMethod.id,
            name: paymentMethod.name,
            code: String(paymentMethod.code).padStart(2, '0'),
            isActive: enabled,
        };
    }

    async findPaymentMethodByCode(code: string): Promise<{ id: number; name: string; code: number } | null> {
        const query = `SELECT id, name, code FROM payment_methods WHERE code = ? LIMIT 1`;
        const rows = await this.database.select(query, [Number(code)]);

        if (!rows.length) {
            return null;
        }

        const row: any = rows[0];

        return {
            id: Number(row.id),
            name: row.name,
            code: Number(row.code),
        };
    }
}