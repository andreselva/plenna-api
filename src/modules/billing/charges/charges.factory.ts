import { IChargeProvider } from "src/Shared/interfaces/IChargeProvider";
import { CHARGE_PROVIDERS_TOKEN } from "./constants/charge-providers.token";
import { Inject, Injectable } from "@nestjs/common";
import { IChargeInput } from "src/Shared/interfaces/IChargeInput";

@Injectable()
export class ChargesFactory {
    private readonly chargeProviders: Map<string, IChargeProvider>;

    constructor(
        @Inject(CHARGE_PROVIDERS_TOKEN)
        providers: IChargeProvider[]
    ) {
        this.chargeProviders = new Map(
            providers.map((provider) => [provider.entityType, provider])
        )
    }

    resolve(entityType: string, entityId: number): Promise<IChargeInput> {
        const provider = this.chargeProviders.get(entityType);
        if (provider === undefined) {
            throw new Error(`Unsupported charge entity type: ${entityType}`);
        }
        return provider.load(entityId);
    }
}