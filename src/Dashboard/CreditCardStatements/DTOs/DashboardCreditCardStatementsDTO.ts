import DahsboardCreditCardDatasetDTO from "./DashboardCreditCardDatasetDTO";

export default class DahsboardCreditCardStatementsDTO {
    labels: string[];
    datasets: DahsboardCreditCardDatasetDTO[];

    constructor(labels: string[], datasets: DahsboardCreditCardDatasetDTO[]) {
        this.labels = labels;
        this.datasets = datasets;
    }
}