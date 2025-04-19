import { DashboardCurrentBalanceDatasetDTO } from "./DashboardCurrentBalanceDatasetDTO";

export class DashboardCurrentBalanceDTO {
    labels: string[];
    datasets: DashboardCurrentBalanceDatasetDTO[];
    remainingBalance: number;

    constructor(labels: string[], datasets: DashboardCurrentBalanceDatasetDTO[], remainingBalance: number) {
        this.labels = labels;
        this.datasets = datasets;
        this.remainingBalance = remainingBalance;
    }
}