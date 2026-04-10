import { BadRequestException } from "@nestjs/common";

export class GatewayIntegrationsException extends BadRequestException {
    constructor(message: string) {
        super(message);
    }
}
