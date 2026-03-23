import { BadRequestException } from "@nestjs/common";
import { LedgerEntry } from "src/EntityModels/ledger-entry";

export class InvalidEventTypeException extends BadRequestException {
    constructor(eventId: number) {
        super(
            {
                messsage: `invalid event type for setting the amount for the event ${eventId}`,
                error: LedgerEntry.ERROR_INVALID_EVENT_TYPE_AMOUNT
            }
        )
    }
}