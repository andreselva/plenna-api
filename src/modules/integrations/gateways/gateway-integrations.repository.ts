import { Injectable } from "@nestjs/common";
import { Gateway } from "src/EntityModels/Gateway";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export class GatewaysIntegrationsRepository extends BaseRepository<Gateway> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext, Gateway);
    }

     async loadGateway(id: number): Promise<Gateway | null> {
        return await this.loadById(id);
    }

    async loadAllGateways(): Promise<Gateway[]> {
        return await this.loadAll();
    }

    async loadAllGatewaysConfiguredForCliendId(): Promise<Gateway[]> {
        const sql = `SELECT g.* FROM gateways g
                        JOIN gateways_configs gc ON g.id = gc.gatewayId
                        WHERE g.clientId = ?`;
        const rows = await this.database.select(sql, [this.authContext.getClientId()]);
        return this.extractToEntity(rows);
    }
}
