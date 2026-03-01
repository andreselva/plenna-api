import IEntity from "src/Shared/interfaces/IEntity";
import EntityModel from "./entity.model";
import { FinancialEventsEnum } from "src/enum/financial-events.enum";
import { PaymentType } from "src/modules/Finance/Payment/Types/payment.type";
import { IFinancialEventsRow } from "src/Shared/interfaces/IFinancialEventsRow";

export class FinancialEvents extends EntityModel implements IEntity {
    public id: number;
    public clientId: number;
    public accountId: number;
    public type: FinancialEventsEnum;
    public amount: number;
    public ocurredAt: string;
    public createdAt: string;
    public sequenceNumber: number;
    public referenceType: PaymentType;
    public referenceId: number;
    public previousHash: string;
    public eventHash: string;

    static fromRow(row: IFinancialEventsRow) {
        const financialEvent = new FinancialEvents();
        financialEvent.id = row.id;
        financialEvent.clientId = row.clientId;
        financialEvent.accountId = row.accountId;
        financialEvent.type = row.type;
        financialEvent.amount = row.amount;
        financialEvent.ocurredAt = row.ocurredAt;
        financialEvent.sequenceNumber = row.sequenceNumber;
        financialEvent.referenceType = row.referenceType;
        financialEvent.referenceId = row.referenceId;
        financialEvent.previousHash = row.previousHash;
        financialEvent.eventHash = row.eventHash;
        return financialEvent;
    }

    getTableName(): string {
        return 'financial_events';
    }

    getPrimaryKey(): string {
        return 'id';
    }

    getIgnoredProperties(): string[] {
        return [];
    }
}