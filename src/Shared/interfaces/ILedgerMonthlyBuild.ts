export interface ILedgerMonthlyBuild {
    id: number;
    clientId: number;
    period: string;
    closedAt: string | null;
    closingBalance: number | null;
    openChargesCount: number;
    openChargesValue: number;
    pendingExpenses: number;
    pendingRevenues: number;
    buildData: object;
    builtAt: string;
    createdAt: string;
}
