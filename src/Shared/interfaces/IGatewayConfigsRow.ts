export interface IGatewayConfigsRow {
    id: number;
    gatewayId: number;
    clientId: number;
    configs: string;
    name?: string;
    gateway?: string;
    icon?: string;
}