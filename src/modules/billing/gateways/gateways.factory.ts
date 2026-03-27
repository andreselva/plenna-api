import { Inject, Injectable } from "@nestjs/common";
import { GatewaysRepository } from "./gateways.repository";
import { IPaymentGateway } from "src/Shared/interfaces/IPaymentGateway";
import { GatewaysException } from "./exceptions/GatewaysException";
import { PAYMENT_GATEWAY_PROVIDERS } from "./constants/payment-gateway-provider.token";

@Injectable()
export class GatewaysFactory {
    private readonly gatewayRegistry: Map<string, IPaymentGateway>;

    constructor(
        private readonly repository: GatewaysRepository,
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
            throw new GatewaysException(`Gateway with id ${id} not found`);
        }

        const provider = this.gatewayRegistry.get(gateway.gateway);
        if (provider === undefined) {
            throw new GatewaysException(`Unsupported gateway: ${gateway.gateway}`);
        }

        return provider;
    }
}
