import { ConflictException } from "@nestjs/common";
import { LedgerEntry } from "src/EntityModels/ledger-entry";

export class EventAlreadyProcessedException extends ConflictException {
    constructor(eventId: number) {
        super(
            {
                message: `Event already processed for the event ${eventId}`,
                error: LedgerEntry.ERROR_DUPLICATE_EVENT
            }
        );
    }  
}