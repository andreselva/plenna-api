import { ChargeEntityType } from "src/enum/charge-entity-type.enum";
import { IChargeInput } from "./IChargeInput";

export interface IChargeProvider {
    readonly entityType: ChargeEntityType;
    load(entityId: number): Promise<IChargeInput>;
}