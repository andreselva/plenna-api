import { FinancialEventsEnum } from "src/enum/financial-events.enum";
import { PaymentType } from "src/modules/Finance/Payment/Types/payment.type";

export interface IFinancialEventsRow {
    id: number;
    clientId: number;
    accountId: number;
    type: FinancialEventsEnum;
    amount: number;
    ocurredAt: string;
    createdAt: string;
    sequenceNumber: number;
    referenceType: PaymentType;
    referenceId: number;
    previousHash: string;
    eventHash: string;
}