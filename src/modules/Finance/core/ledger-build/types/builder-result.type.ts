export interface EventBuilderResult {
    count: number;
    totalAmount: number;
}

export interface BankBalanceBuilderResult {
    totalLiquidBalance: number;
    byAccount: Array<{ accountId: number; balance: number }>;
}

export interface PendingItemsResult {
    count: number;
    totalValue: number;
}
