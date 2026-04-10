import { NotFoundException } from "@nestjs/common";

export class ChargeNotFoundException extends NotFoundException {
    constructor(chargeId: number | string) {
        super(`Charge ${chargeId} not found`);
    }
}
