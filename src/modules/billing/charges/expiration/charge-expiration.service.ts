import { Injectable } from "@nestjs/common";
import { Charge } from "src/EntityModels/Charge";
import { ChargeStatus } from "src/enum/charge-status.enum";
import { ChargeEntityType } from "src/enum/charge-entity-type.enum";
import { ChargesEventsEnum } from "src/enum/charges-events.enum";
import { RevenueStatus } from "src/modules/Finance/Revenues/Types/revenue.status.type";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import DataMapper from "src/Shared/mapper/DataMapper";
import DateHelper from "src/Shared/Utils/DateHelper";

const EXPIRATION_HOURS = 24;

@Injectable()
export class ChargeExpirationService {
    constructor(private readonly database: MySQLDatabase) {}

    async findExpired(): Promise<Charge[]> {
        const query = `
            SELECT * FROM charges
            WHERE status = ?
              AND createdAt < DATE_SUB(NOW(), INTERVAL ${EXPIRATION_HOURS} HOUR)
        `;
        const result = await this.database.select(query, [ChargeStatus.AWAITING_PAYMENT]);
        return DataMapper.toEntities(result, Charge);
    }

    async expireCharge(charge: Charge): Promise<void> {
        await this.database.execute(
            `UPDATE charges SET status = ? WHERE id = ?`,
            [ChargeStatus.EXPIRED, charge.id],
        );

        await this.logExpirationEvent(charge);

        if (charge.entityType === ChargeEntityType.REVENUE) {
            await this.database.execute(
                `UPDATE revenue SET status = ?, paymentDate = NULL WHERE id = ? AND clientId = ?`,
                [RevenueStatus.PENDING, charge.entityId, charge.clientId],
            );
        }

        // TODO: registrar FinancialEvent CHARGE_EXPIRED no ledger.
        // Requer solução de auth context para jobs de background (clientId = charge.clientId).
    }

    private async logExpirationEvent(charge: Charge): Promise<void> {
        const now = DateHelper.getCurrentDate();
        await this.database.execute(
            `INSERT INTO charges_events (chargeId, username, event, description, clientId, createdAt)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [charge.id, 'system', ChargesEventsEnum.CHARGE_EXPIRED, '', charge.clientId, now],
        );
    }
}
