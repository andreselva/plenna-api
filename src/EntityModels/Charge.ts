import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import { ChargeStatus } from "src/enum/charge-status.enum";
import { IChargeRow } from "src/Shared/interfaces/IChargeRow";

export class Charge extends EntityModel implements IEntity {
    public id: number;
    public clientId: number;
    public expenseId: number;
    public gatewayId: number;
    public billingRuleId: number;
    public customerId: number;
    public status: ChargeStatus;
    public amount: number;
    public qrcode: string;
    public externalId: string;
    public paymentLink: string;
    public paymentAt: string;

    public static ignoredProperties = [];

    public static fromRow(i: IChargeRow): Charge {
        const charge = new Charge();
        charge.id = i.id;
        charge.clientId = i.clientId;
        charge.expenseId = i.expenseId;
        charge.gatewayId = i.gatewayId;
        charge.billingRuleId = i.billingRuleId;
        charge.customerId = i.customerId;
        charge.status = i.status;
        charge.amount = i.amount;
        charge.qrcode = i.qrcode;
        charge.externalId = i.externalId;
        charge.paymentLink = i.paymentLink;
        charge.paymentAt = i.paymentAt;
        return charge;
    }

    getTableName(): string {
        return 'charges';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return Charge.ignoredProperties;
    }
}