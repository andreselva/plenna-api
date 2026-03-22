import EntityModel from "./entity.model";
import IPaymentInterface from "src/Shared/interfaces/IPaymentInterface";
import DateHelper from "src/Shared/Utils/DateHelper";
import PaymentInicialDataDTO from "src/modules/Finance/Payment/DTOs/PaymentInicialDataDTO";
import IEntity from "src/Shared/interfaces/IEntity";

export default class Payment extends EntityModel implements IEntity {
    public id: number = 0;
    public payable_id: number = 0;
    public payable_type: string = '';
    public value: number = 0;
    public payment_date: string = '';
    public clientId: number = 0;
    public accountId: number = 0;
    public reversed: string;

    constructor() {
        super();
    }

    public static ignoredProperties: string[] = [];

    static fromDTO(dto: PaymentInicialDataDTO) {
        const payment = new Payment();
        payment.id = dto.id ?? 0;
        payment.payable_id = dto.payableId;
        payment.payable_type = dto.payableType;
        payment.value = dto.value;
        payment.payment_date = DateHelper.toISODate(dto.paymentDate) ?? dto.paymentDate;
        payment.accountId = dto.accountId;
        payment.reversed = dto.reversed ?? null;
        return payment;
    }

    static fromRow(row: IPaymentInterface) {
        const payment = new Payment();
        payment.id = row.id;
        payment.payable_id = row.payable_id;
        payment.payable_type = row.payable_type;
        payment.value = Number(row.value);
        payment.payment_date = DateHelper.toISODate(row.payment_date) as string;
        payment.clientId = row.clientId;
        payment.reversed = row.reversed;
        payment.accountId = row.accountId;
        return payment;
    }

    getTableName() {
        return 'payment';
    }

    getPrimaryKey() {
        return 'id';
    }

    getIgnoredProperties() {
        return Payment.ignoredProperties;
    }

    addIgnoredProperty(property: string) {
        Payment.ignoredProperties.push(property);
    }
}