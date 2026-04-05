import { Injectable } from "@nestjs/common";
import { ChargeEvent } from "src/EntityModels/ChargeEvent";
import { Charge } from "src/EntityModels/Charge";
import { ChargesEventsEnum } from "src/enum/charges-events.enum";
import { AuthContextService } from "src/modules/Auth/auth-context.service";
import { ChargeEventsRepository } from "./charge-events.repository";

@Injectable()
export class ChargeEventsService {
    constructor(
        private readonly repository: ChargeEventsRepository,
        private readonly authContext: AuthContextService
    ) {}

    async logEvent(charge: Charge, eventString: ChargesEventsEnum): Promise<void> {
        const event = new ChargeEvent();

        if (eventString === ChargesEventsEnum.CHARGE_GENERATED) {
            event.id = 0;
        }

        event.chargeId = charge.id;
        event.username = this.authContext.getUser().username;
        event.event = eventString;
        event.description = "";
        event.clientId = this.authContext.getClientId();

        if (eventString === ChargesEventsEnum.CHARGE_SENDED_TO_GATEWAY) {
            event.description = `Cobrança enviada para gateway ${charge.gateway}. Status atual: ${charge.status}`;
        }

        await this.repository.save(event, true);
    }

    async loadHistory(chargeID: number): Promise<ChargeEvent[]> {
        return await this.repository.loadHistoryByChargeId(chargeID);
    }
}