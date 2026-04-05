import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import { IChargeEventRow } from "src/Shared/interfaces/IChargeEventRow";
import { ChargesEventsEnum } from "src/enum/charges-events.enum";

export class ChargeEvent extends EntityModel implements IEntity {
    public id: number;
    public clientId: number;
    public chargeId: number;
    public username: string;
    public event: ChargesEventsEnum;
    public description: string;
    public createdAt: string;

    public static fromRow(i: IChargeEventRow): ChargeEvent {
        const chargeEvent = new ChargeEvent();
        chargeEvent.id = i.id;
        chargeEvent.clientId = i.clientId;
        chargeEvent.chargeId = i.chargeId;
        chargeEvent.username = i.username;
        chargeEvent.event = i.event;
        chargeEvent.description = i.description;
        chargeEvent.createdAt = i.createdAt;
        return chargeEvent;
    }

    getTableName(): string {
        return 'charges_events';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return [];
    }
    
}