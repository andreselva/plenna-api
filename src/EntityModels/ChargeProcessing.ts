import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";

export class ChargeProcessing extends EntityModel implements IEntity {
    public id: number;
    public clientId: number;
    public entityId: number;
    public entityType: string;
    public date: string;

    getTableName(): string {
        return 'charges_processing';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return [];
    }
}