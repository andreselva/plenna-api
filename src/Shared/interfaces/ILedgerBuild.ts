export interface ILedgerBuild {
    id: number;
    clientId: number;
    builtAt: string;
    totalLiquidBalance: number;
    openChargesCount: number;
    openChargesValue: number;
    pendingExpensesCount: number;
    pendingExpensesValue: number;
    pendingRevenuesCount: number;
    pendingRevenuesValue: number;
    buildData: object;
    createdAt: string;
}
