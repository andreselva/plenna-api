import DashboardMonthlyProgressDataset from "./DashboardMonthlyProgressDataset";

export default class DashboardMonthlyProgressDTO {
    labels: string[];
    datasets: DashboardMonthlyProgressDataset[];

    constructor(labels: string[], datasets: DashboardMonthlyProgressDataset[]) {
        this.labels = labels;
        this.datasets = datasets;
    }
}