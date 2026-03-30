import { Injectable } from "@nestjs/common";
import { Gateway } from "src/EntityModels/Gateway";
import { GatewayConfigs } from "src/EntityModels/GatewayConfigs";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import MySQLDatabase from "src/modules/Config/Database/MySQLDatabase";
import BaseRepository from "src/Shared/Repositories/BaseRepository";

@Injectable()
export class GatewaysRepository extends BaseRepository<Gateway> {
    constructor(database: MySQLDatabase, authContext: AuthContextService) {
        super(database, authContext, Gateway);
    }

    async loadConfiguredGateways() {
        const query = `
            SELECT
                gc.id,
                gc.gatewayId,
                gc.clientId,
                gc.configs,
                g.name,
                g.gateway,
                g.icon,
                gc.isActive
            FROM gateway_configs gc
            JOIN gateways g ON g.id = gc.gatewayId
            WHERE gc.clientId = ?
            ORDER BY gc.id ASC
        `;

        const rows = await this.database.select(query, [this.authContext.getClientId()]);

        return rows.map((row: any) => ({
            id: Number(row.id),
            gatewayId: Number(row.gatewayId),
            clientId: Number(row.clientId),
            name: row.name,
            gateway: row.gateway,
            icon: row.icon,
            isActive: Boolean(row.isActive),
            config: this.parseConfigs(row.configs),
        }));
    }

    async loadAvailableGateways() {
        const rows = await this.loadAll();

        return rows.map((row) => ({
            id: row.id,
            name: row.name,
            gateway: row.gateway,
            icon: row.icon,
        }));
    }

    private parseConfigs(configs: unknown) {
        if (!configs) {
            return {};
        }

        if (typeof configs === 'object') {
            return configs;
        }

        if (typeof configs === 'string') {
            try {
                return JSON.parse(configs);
            } catch {
                return {};
            }
        }

        return {};
    }

    async saveGatewayConfig(gatewayConfig: GatewayConfigs) {
        gatewayConfig.clientId = this.authContext.getClientId();
        return await this.save(gatewayConfig);
    }
}