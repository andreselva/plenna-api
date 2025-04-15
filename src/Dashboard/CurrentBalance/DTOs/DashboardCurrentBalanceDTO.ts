import { DashboardCurrentBalanceDatasetDTO } from "./DashboardCurrentBalanceDatasetDTO";

export class DashboardCurrentBalanceDTO {
    labels: string[];
    datasets: DashboardCurrentBalanceDatasetDTO[];

    constructor(labels: string[], datasets: DashboardCurrentBalanceDatasetDTO[]) {
        this.labels = labels;
        this.datasets = datasets;
    }
}