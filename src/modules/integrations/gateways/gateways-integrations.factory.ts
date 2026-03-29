import { Inject, Injectable } from "@nestjs/common";
import { IPaymentGateway } from "src/Shared/interfaces/IPaymentGateway";
import { PAYMENT_GATEWAY_PROVIDERS } from "./constants/payment-gateway-provider.token";
import { GatewaysIntegrationsRepository } from "./gateway-integrations.repository";
import { GatewayIntegrationsException } from "./exceptions/gateway-integrations.exception";

@Injectable()
export class GatewaysIntegrationsFactory {
    private readonly gatewayRegistry: Map<string, IPaymentGateway>;

    constructor(
        private readonly repository: GatewaysIntegrationsRepository,
        @Inject(PAYMENT_GATEWAY_PROVIDERS)
        gateways: IPaymentGateway[]
    ) {
        this.gatewayRegistry = new Map(
            gateways.map((gateway) => [gateway.gateway, gateway])
        );
    }

    async resolve(id: number): Promise<IPaymentGateway> {
        const gateway = await this.repository.loadGateway(id);
        if (gateway === null) {
            throw new GatewayIntegrationsException(`Gateway with id ${id} not found`);
        }

        const provider = this.gatewayRegistry.get(gateway.gateway);
        if (provider === undefined) {
            throw new GatewayIntegrationsException(`Unsupported gateway: ${gateway.gateway}`);
        }

        return provider;
    }
}
