import { BadRequestException } from "@nestjs/common";

export class ChargesException extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
}