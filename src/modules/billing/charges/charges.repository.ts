import { Injectable } from "@nestjs/common";
import { Charge } from "src/EntityModels/Charge";
import { ChargeProcessing } from "src/EntityModels/ChargeProcessing";
import { Customer } from "src/EntityModels/Customer";
import Revenue from "src/EntityModels/Revenue";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import DataMapper from "src/Shared/mapper/DataMapper";
import QueryBuilder from "src/Shared/QueryBuilder/QueryBuilder";
import BaseRepository from "src/Shared/Repositories/BaseRepository";
import { ChargeStatus } from "src/enum/charge-status.enum";
import { RevenueStatus } from "src/modules/Finance/Revenues/Types/revenue.status.type";

const DEFAULT_EXPIRATION_HOURS_FOR_CHARGES = 24;

@Injectable()
export class ChargesRepository extends BaseRepository<Charge> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext, Charge);
    }

    async findById(chargeId: number): Promise<Charge | undefined> {
        const query = `SELECT * FROM charges WHERE id = ? AND clientId = ?`;
        const result = await this.database.select(query, [chargeId, this.authContext.getClientId()]);
        return DataMapper.toEntities(result, Charge)[0];
    }

    async findByExternalId(externalId: string): Promise<Charge | undefined> {
        const query = `SELECT * FROM charges WHERE externalId = ?`;
        const result = await this.database.select(query, [externalId]);
        return DataMapper.toEntities(result, Charge)[0];
    }

    async updateStatus(chargeId: number, status: ChargeStatus, paymentAt?: string): Promise<void> {
        const query = `UPDATE charges SET status = ?, paymentAt = ? WHERE id = ? AND clientId = ?`;
        await this.database.execute(query, [status, paymentAt ?? null, chargeId, this.authContext.getClientId()]);
    }

    async updateRevenueStatus(revenueId: number, status: RevenueStatus, paymentDate: string | null): Promise<void> {
        const query = `UPDATE revenue SET status = ?, paymentDate = ? WHERE id = ? AND clientId = ?`;
        await this.database.execute(query, [status, paymentDate, revenueId, this.authContext.getClientId()]);
    }

    async loadRevenue(revenueId: number, applyForUpdate: boolean): Promise<Revenue> {
        const query = applyForUpdate
            ? `SELECT * FROM revenue WHERE id = ? AND clientId = ? FOR UPDATE`
            : `SELECT * FROM revenue WHERE id = ? AND clientId = ?`;
        const result = await this.database.select(query, [revenueId, this.authContext.getClientId()]);
        return DataMapper.toEntities(result, Revenue)[0];
    }

    async loadCustomer(customerId: number): Promise<Customer> {
        const query = `SELECT * FROM customer WHERE id = ? AND clientId = ?`;
        const result = await this.database.select(query, [customerId, this.authContext.getClientId()]);
        return DataMapper.toEntities(result, Customer)[0];
    }

    async saveProcessing(processing: ChargeProcessing): Promise<void> {
        if (processing.clientId === null || processing.clientId === undefined) {
            processing.clientId = this.authContext.getClientId();
        }
        const { sql, values } = QueryBuilder.buildQuery(processing, processing.getTableName(), processing.getPrimaryKey(), processing.getIgnoredProperties());
        await this.database.execute(sql, values);
    }

    async findExpiredCharges(): Promise<Charge[]> {
      const query = `
          SELECT * FROM charges
          WHERE status = ?
            AND clientId = ?
            AND createdAt < DATE_SUB(NOW(), INTERVAL ${DEFAULT_EXPIRATION_HOURS_FOR_CHARGES} HOUR)
      `;
      const result = await this.database.select(query, [ChargeStatus.AWAITING_PAYMENT, this.authContext.getClientId()]);
      return this.extractToEntity(result);
  }
}
