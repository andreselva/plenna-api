export interface ITransferRow {
    id: number;
    clientId: number;
    originAccount: number;
    targetAccount: number;
    amount: number;
    transferDate: string;
    createdAt: string;
    updatedAt: string;
}
