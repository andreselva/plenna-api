import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import { ChargeStatus } from "src/enum/charge-status.enum";
import { IChargeRow } from "src/Shared/interfaces/IChargeRow";
import { ChargeEntityType } from "src/enum/charge-entity-type.enum";

export class Charge extends EntityModel implements IEntity {
    public static INVALID_AMOUNT_ERROR = 'Valor inválido.';
    public static INVALID_PAYMENT_METHOD_ERROR = 'Método de pagamento inválido.';
    public static INVALID_CUSTOMER_ERROR = 'Cliente inválido.';
    public static INVALID_ENTITY_ID_ERROR = 'ID da entidade inválido.';
    public static ENTITY_TYPE_REQUIRED_ERROR = 'Tipo da entidade é obrigatório.';
    public static INVALID_CLIENT_ID_ERROR = 'Client ID inválido.';
    public static MULTIPLE_BILLING_RULES_ERROR_CUSTOMER = 'Múltiplas regras de cobrança encontradas para o mesmo método de pagamento e cliente.';
    public static MULTIPLE_BILLING_RULES_ERROR = 'Múltiplas regras de cobrança encontradas para o mesmo método de pagamento.';
    public static CUSTOMER_NOT_FOUND_ERROR = 'Cliente não encontrado.';
    
    public id: number;
    public title: string;
    public clientId: number;
    public entityId: number;
    public entityType: ChargeEntityType;
    public gatewayId: number;
    public billingRuleId: number;
    public customerId: number;
    public status: ChargeStatus;
    public amount: number;
    public qrcode: string;
    public externalId: string;
    public paymentLink: string;
    public paymentAt: string;
    public gateway: string;

    public static ignoredProperties = [];

    public static fromRow(i: IChargeRow): Charge {
        const charge = new Charge();
        charge.id = i.id;
        charge.clientId = i.clientId;
        charge.entityId = i.entityId;
        charge.entityType = i.entityType;
        charge.gatewayId = i.gatewayId;
        charge.billingRuleId = i.billingRuleId;
        charge.customerId = i.customerId;
        charge.status = i.status;
        charge.amount = i.amount;
        charge.qrcode = i.qrcode;
        charge.externalId = i.externalId;
        charge.paymentLink = i.paymentLink;
        charge.paymentAt = i.paymentAt;
        charge.title = i.title;
        charge.gateway = i.gateway;
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