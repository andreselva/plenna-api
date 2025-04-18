import MonthlyProgressDatasetConfig from "../ChartConfig/MonthlyProgressDatasetConfig";
import MonthlyProgressDatasetInterface from "./MonthlyProgressDataSetInterface";

export default class DashboardMonthlyProgressDataset {
    datasets: MonthlyProgressDatasetInterface[];

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
