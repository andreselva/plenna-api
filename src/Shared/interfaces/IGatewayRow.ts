import { GatewayEnum } from "src/enum/gateway.enum";

export interface IGatewayRow {
    id: number;
    name: string;
    gateway: GatewayEnum;
    icon: string;
}