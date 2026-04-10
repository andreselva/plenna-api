import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import { IPaymentMethodClientRow } from "src/Shared/interfaces/IPaymentMethodClientRow";

export class PaymentMethodClient extends EntityModel implements IEntity {
    public id: number;
    public clientId: number;
    public paymentMethodId: number;
    public enabled: boolean;

    public static fromRow(i: IPaymentMethodClientRow) {
        const pmc = new PaymentMethodClient();
        pmc.id = i.id;
        pmc.clientId = i.clientId;
        pmc.paymentMethodId = i.paymentMethodId;
        pmc.enabled = i.enabled;
        return pmc;
    }

    getTableName(): string {
        return 'payment_method_client';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return [];
    }
}