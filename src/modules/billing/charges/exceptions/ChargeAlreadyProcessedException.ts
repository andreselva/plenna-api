import { ConflictException } from "@nestjs/common";
import { Charge } from "src/EntityModels/Charge";

export class ChargeAlreadyProcessedException extends ConflictException {
    constructor(entityId: number, entityType: string) {
        super(
            {
                message: `Charge already processed for the event ${entityId} and entity type ${entityType}.`,
                error: Charge.ERROR_DUPLICATE_CHARGE
            }
        );
    }  
}