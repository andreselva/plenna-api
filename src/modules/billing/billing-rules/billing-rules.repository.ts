import { Injectable } from "@nestjs/common";
import { BillingRule } from "src/EntityModels/BillingRule";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import { PaymentMethodsRepository } from "../payment-methods/payment-methods.repository";

@Injectable()
export class BillingRulesRepository extends BaseRepository<BillingRule> {
    constructor(
        database: MySQLDatabase,
        authContext: AuthContextService,
        private readonly paymentMethodsRepository: PaymentMethodsRepository,
    ) {
        super(database, authContext, BillingRule);
    }

    async loadBillingRule(id: number): Promise<BillingRule | null> {
        return await this.loadById(id);
    }

    async loadBillingRuleByPaymentMethodAndCustomer(paymentMethodId: number, customerId: number): Promise<any[]> {
        const sql = `
            SELECT
                br.id,
                br.clientId,
                br.gatewayId,
                br.paymentMethodId,
                br.customerId,
                LPAD(pm.code, 2, '0') AS paymentMethodCode,
                pm.name AS paymentMethodName,
                gc.name AS gatewayName,
                gc.gateway AS gateway,
                gc.icon AS gatewayIcon,
                gcfg.gatewayId AS configuredGatewayId
            FROM billing_rules br
            INNER JOIN payment_methods pm ON pm.id = br.paymentMethodId
            LEFT JOIN gateway_configs gcfg ON gcfg.id = br.gatewayId
            LEFT JOIN gateways gc ON gc.id = gcfg.gatewayId
            WHERE br.paymentMethodId = ?
              AND br.customerId = ?
              AND br.clientId = ?
        `;

        const rows = await this.database.select(sql, [paymentMethodId, customerId, this.authContext.getClientId()]);
        return rows.map((row: any) => this.normalizeBillingRuleRow(row));
    }

    async loadDefaultBillingRuleByPaymentMethod(paymentMethodId: number): Promise<any[]> {
        const sql = `
            SELECT
                br.id,
                br.clientId,
                br.gatewayId,
                br.paymentMethodId,
                br.customerId,
                LPAD(pm.code, 2, '0') AS paymentMethodCode,
                pm.name AS paymentMethodName,
                gc.name AS gatewayName,
                gc.gateway AS gateway,
                gc.icon AS gatewayIcon,
                gcfg.gatewayId AS configuredGatewayId
            FROM billing_rules br
            INNER JOIN payment_methods pm ON pm.id = br.paymentMethodId
            LEFT JOIN gateway_configs gcfg ON gcfg.id = br.gatewayId
            LEFT JOIN gateways gc ON gc.id = gcfg.gatewayId
            WHERE br.paymentMethodId = ?
              AND (br.customerId = 0 OR br.customerId IS NULL)
              AND br.clientId = ?
        `;

        const rows = await this.database.select(sql, [paymentMethodId, this.authContext.getClientId()]);
        return rows.map((row: any) => this.normalizeBillingRuleRow(row));
    }

    async loadAllBillingRules(): Promise<any[]> {
        const sql = `
            SELECT
                br.id,
                br.clientId,
                br.gatewayId,
                br.paymentMethodId,
                br.customerId,
                LPAD(pm.code, 2, '0') AS paymentMethodCode,
                pm.name AS paymentMethodName,
                gc.name AS gatewayName,
                gc.gateway AS gateway,
                gc.icon AS gatewayIcon,
                gcfg.gatewayId AS configuredGatewayId
            FROM billing_rules br
            INNER JOIN payment_methods pm ON pm.id = br.paymentMethodId
            LEFT JOIN gateway_configs gcfg ON gcfg.id = br.gatewayId
            LEFT JOIN gateways gc ON gc.id = gcfg.gatewayId
            WHERE br.clientId = ?
            ORDER BY pm.code ASC, br.id ASC
        `;

        const rows = await this.database.select(sql, [this.authContext.getClientId()]);
        return rows.map((row: any) => this.normalizeBillingRuleRow(row));
    }

    async upsertDefaultBillingRuleByPaymentMethodCode(paymentMethodCode: string, gatewayId: number): Promise<any> {
        const paymentMethod = await this.paymentMethodsRepository.findPaymentMethodByCode(paymentMethodCode);

        if (!paymentMethod) {
            throw new Error(`Payment method not found for code ${paymentMethodCode}`);
        }

        const existing = await this.loadExistingDefaultRule(paymentMethod.id);

        if (existing) {
            await this.database.execute(
                `UPDATE billing_rules SET gatewayId = ? WHERE id = ? AND clientId = ?`,
                [gatewayId, existing.id, this.authContext.getClientId()]
            );
        } else {
            await this.database.execute(
                `INSERT INTO billing_rules (clientId, gatewayId, paymentMethodId, customerId) VALUES (?, ?, ?, NULL)`,
                [this.authContext.getClientId(), gatewayId, paymentMethod.id]
            );
        }

        const rules = await this.loadDefaultBillingRuleByPaymentMethod(paymentMethod.id);
        if (!rules.length) {
            throw new Error('Billing rule could not be loaded after save');
        }

        return rules[0];
    }

    private async loadExistingDefaultRule(paymentMethodId: number): Promise<{ id: number } | null> {
        const sql = `
            SELECT id
            FROM billing_rules
            WHERE clientId = ?
              AND paymentMethodId = ?
              AND (customerId = 0 OR customerId IS NULL)
            ORDER BY id DESC
            LIMIT 1
        `;

        const rows = await this.database.select(sql, [this.authContext.getClientId(), paymentMethodId]);

        if (!rows.length) {
            return null;
        }

        return { id: Number((rows[0] as any).id) };
    }

    private normalizeBillingRuleRow(row: any) {
        return {
            id: Number(row.id),
            clientId: Number(row.clientId),
            gatewayId: row.gatewayId !== null && row.gatewayId !== undefined ? Number(row.gatewayId) : null,
            paymentMethodId: row.paymentMethodId !== null && row.paymentMethodId !== undefined ? Number(row.paymentMethodId) : null,
            customerId: row.customerId !== null && row.customerId !== undefined ? Number(row.customerId) : null,
            paymentMethodCode: String(row.paymentMethodCode ?? '').padStart(2, '0'),
            paymentMethodName: row.paymentMethodName,
            gateway: row.configuredGatewayId
                ? {
                    id: Number(row.gatewayId),
                    gatewayId: Number(row.configuredGatewayId),
                    name: row.gatewayName,
                    gateway: row.gateway,
                    icon: row.gatewayIcon,
                }
                : null,
        };
    }
}