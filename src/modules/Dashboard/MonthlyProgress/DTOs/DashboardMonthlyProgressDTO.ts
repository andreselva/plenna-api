import MonthlyProgressDatasetInterface from "./MonthlyProgressDataSetInterface";

export default class DashboardMonthlyProgressDTO {
    labels: string[];
    datasets: MonthlyProgressDatasetInterface[];

    constructor(labels: string[], datasets: MonthlyProgressDatasetInterface[]) {
        this.labels = labels;
        this.datasets = datasets;
    }
}