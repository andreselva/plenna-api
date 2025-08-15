import EntityModel from "src/EntityModels/entity.model";
import PaymentInicialDataDTO from "src/modules/Finance/Payment/DTOs/PaymentInicialDataDTO";
import { PaymentType } from "src/modules/Finance/Payment/Types/payment.type";
import IEntity from "src/Shared/interfaces/IEntity";
import IPaymentRow from "src/Shared/interfaces/IPaymentInterface";
import DateHelper from "src/Shared/Utils/DateHelper";

export default class Payment extends EntityModel implements IEntity {
    public id: number = 0;
    public clientId: number;
    public value: number = 0;
    public payment_date: string = '';
    public payable_id: number = 0;
    public payable_type: PaymentType;

    constructor() {
        super();
    }

   static fromDTO(dto: PaymentInicialDataDTO) {
        const payment = new Payment();
        payment.value = dto.value;
        payment.payment_date = dto.paymentDate;
        payment.payable_id = dto.payableId;
        payment.payable_type = dto.payableType;
        payment.id = dto.id ?? 0;
        return payment;
   }

   static fromRow(row: IPaymentRow) {
        const payment = new Payment();
        payment.id = row.id;
        payment.value = row.value;
        payment.payment_date = DateHelper.toISODate(row.payment_date) as string;
        payment.payable_id = row.payable_id;
        payment.payable_type = row.payable_type
        return payment;
   }

   getTableName(): string {
       return 'payment';
   }

   getPrimaryKey(): string {
       return 'id';
   }

   getIgnoredProperties(): string[] {
       return [];
   }
}