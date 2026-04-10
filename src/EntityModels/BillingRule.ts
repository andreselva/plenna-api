import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import { IBillingRuleRow } from "src/Shared/interfaces/IBillingRuleRow";

export class BillingRule extends EntityModel implements IEntity {
    public id: number;
    public clientId: number;
    public gatewayId: number;
    public paymentMethodId: number;
    public customerId: number;

    public static fromRow(i: IBillingRuleRow): BillingRule {
        const r = new BillingRule();
        r.id = i.id;
        r.clientId = i.clientId;
        r.gatewayId = i.gatewayId;
        r.paymentMethodId = i.paymentMethodId;
        r.customerId = i.customerId;
        return r;
    }

    getTableName(): string {
        return 'billing_rules';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return [];
    }
}