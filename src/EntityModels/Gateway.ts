import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import { GatewayEnum } from "src/enum/gateway.enum";
import { IGatewayRow } from "src/Shared/interfaces/IGatewayRow";

export class Gateway extends EntityModel implements IEntity {
    public id: number;
    public name: string;
    public gateway: GatewayEnum;
    public icon: string;

    public static fromRow(i: IGatewayRow) {
        const gateway = new Gateway();
        gateway.id = i.id;
        gateway.name = i.name;
        gateway.gateway = i.gateway;
        gateway.icon = i.icon;
        return gateway;
    }

    getTableName(): string {
        return 'gateways';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return [];
    }
}