import { BadRequestException } from "@nestjs/common";
import { LedgerEntry } from "src/EntityModels/ledger-entry";

export class InvalidQuantityLedgerEntriesException extends BadRequestException {
    constructor(eventId: number) {
        super(
            {
                message: `Invalid ledger entries quantity for the event ${eventId}`,
                error: LedgerEntry.ERROR_INVALID_QTY_ENTRIES
            }
        )
    }
}