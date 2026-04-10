import { BadRequestException } from "@nestjs/common";
import { ChargeStatus } from "src/enum/charge-status.enum";

export class InvalidChargeTransitionException extends BadRequestException {
    constructor(current: ChargeStatus, target: ChargeStatus) {
        super(`Invalid charge transition: ${current} → ${target}`);
    }
}
