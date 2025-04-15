import { DashboardExpenseByCategoryDatasetDTO } from "./DashboardExpenseByCategoryDatasetDTO";

export class DashboardExpenseByCategoryDTO {
    labels: string[];
    datasets: DashboardExpenseByCategoryDatasetDTO[];

    constructor(labels: string[], datasets: DashboardExpenseByCategoryDatasetDTO[]) {
        this.labels = labels;
        this.datasets = datasets;
    }
}