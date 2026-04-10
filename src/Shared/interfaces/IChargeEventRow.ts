import { ChargesEventsEnum } from "src/enum/charges-events.enum";

export interface IChargeEventRow {
    id: number;
    clientId: number;
    chargeId: number;
    username: string;
    event: ChargesEventsEnum;
    description: string;
    createdAt: string;
}