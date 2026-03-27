import { Injectable } from "@nestjs/common";
import { BillingRule } from "src/EntityModels/BillingRule";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export class BillingRulesRepository extends BaseRepository<BillingRule> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext, BillingRule);
    }

    async loadBillingRule(id: number): Promise<BillingRule | null> {
        return await this.loadById(id);
    }

    async loadBillingRuleByPaymentMethodAndCustomer(paymentMethodId: number, customerId: number): Promise<BillingRule[]> {
        const sql = `SELECT * FROM billing_rules WHERE paymentMethodId = ? AND customerId = ? AND clientId = ?`;
        const rows = await this.database.select(sql, [paymentMethodId, customerId, this.authContext.getClientId()]);
        return this.extractToEntity(rows);
    }

    async loadDefaultBillingRuleByPaymentMethod(paymentMethodId: number): Promise<BillingRule[]> {
        const sql = `SELECT * FROM billing_rules WHERE paymentMethodId = ? AND (customerId = 0 OR customerId IS NULL) AND clientId = ?`;
        const rows = await this.database.select(sql, [paymentMethodId, this.authContext.getClientId()]);
        return this.extractToEntity(rows);
    }

    async loadAllBillingRules(): Promise<BillingRule[]> {
        return await this.loadAll();
    }
}
