import { Injectable } from "@nestjs/common";
import { Gateway } from "src/EntityModels/Gateway";
import { GatewayConfigs } from "src/EntityModels/GatewayConfigs";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import DataMapper from "src/Shared/mapper/DataMapper";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export class GatewaysRepository extends BaseRepository<Gateway> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext, Gateway);
    }

    async loadConfiguredGateways() {
        const query = `SELECT
                        *
                        FROM gateways g
                            JOIN gateway_configs gc on gc.gatewayId = g.id
                        WHERE gc.clientId = ?`;
        const rows = await this.database.select(query, [this.authContext.getClientId()]);
        return DataMapper.toEntities(rows, GatewayConfigs);
    }
}
