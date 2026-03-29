import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import { IGatewayConfigsRow } from "src/Shared/interfaces/IGatewayConfigsRow";

export class GatewayConfigs extends EntityModel implements IEntity {
    public id: number;
    public gatewayId: number;
    public clientId: number;
    public configs: string;
    public name?: string;
    public gateway?: string;
    public icon?: string;

    public static ignoredProperties = ['name', 'gateway', 'icon'];

    public static fromRow(i: IGatewayConfigsRow): GatewayConfigs {
        const gc = new GatewayConfigs();
        gc.id = i.id;
        gc.gatewayId = i.gatewayId;
        gc.clientId = i.clientId;
        gc.configs = i.configs;
        gc.name = i.name;
        gc.gateway = i.gateway;
        gc.icon = i.icon;
        return gc;
    }

    getTableName(): string {
        return 'gateway_configs';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return GatewayConfigs.ignoredProperties;
    }
}