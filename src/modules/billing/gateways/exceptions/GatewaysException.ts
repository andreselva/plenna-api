import { BadRequestException } from "@nestjs/common";

export class GatewaysException extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
}
