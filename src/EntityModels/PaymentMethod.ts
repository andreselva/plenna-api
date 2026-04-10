import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import { IPaymentMethodRow } from "src/Shared/interfaces/IPaymentMethodRow";

export class PaymentMethod extends EntityModel implements IEntity {
    public id: number;
    public name: string
    public code: number;

    public static fromRow(row: IPaymentMethodRow): PaymentMethod {
        const paymentMethod = new PaymentMethod();
        paymentMethod.id = row.id;
        paymentMethod.name = row.name;
        paymentMethod.code = row.code;
        return paymentMethod;
    }
    
    getTableName(): string {
        return 'payment_methods';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return [];
    }
}