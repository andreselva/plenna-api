import MonthlyProgressDatasetConfig from "../ChartConfig/MonthlyProgressDatasetConfig";

export default class DashboardMonthlyProgressDataset {
    datasets: any[];

    constructor(
        expensesValue: number[],
        revenuesValue: number[],
    ) {
        this.datasets = [
            MonthlyProgressDatasetConfig.toDataSet({
                data: revenuesValue,
                label: 'Receitas'
            }),
            MonthlyProgressDatasetConfig.toDataSet({
                data: expensesValue,
                label: 'Despesas'
            }),
        ];
    }
}
