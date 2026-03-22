import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";

export class LedgerEventProcessing extends EntityModel implements IEntity {
    public id: number;
    public eventId: number;
    public processedAt: string;

    getTableName(): string {
        return 'ledger_event_processing';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return [];
    }
}