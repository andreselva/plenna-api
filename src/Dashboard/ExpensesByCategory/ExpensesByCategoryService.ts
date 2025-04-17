import { Injectable } from "@nestjs/common";
import { DashboardExpenseByCategoryDatasetDTO } from "./DTOs/DashboardExpenseByCategoryDatasetDTO";
import { DashboardExpenseByCategoryDTO } from "./DTOs/DashboardExpenseByCategoryDTO";
import { ExpensesByCategoryRepository } from "./ExpensesByCategoryRepository";
import ExpensesByCategoryChartConfig from "./ChartConfig/ExpensesByCategoryChartConfig";

@Injectable()
export class ExpensesByCategoryService {
    constructor(
        private readonly repository: ExpensesByCategoryRepository
    ) { }

    async getExpensesByCategoryData() {
        const data = await this.repository.getTotalExpenses();

        const labels: string[] = [];
        const totals: number[] = [];

        data.forEach(item => {
            labels.push(item.name);
            totals.push(item.value);
        })

        const expensesByCategoryDataset = new DashboardExpenseByCategoryDatasetDTO(
            "Gastos por categoria",
            totals,
            ExpensesByCategoryChartConfig.getBackgroundColor(),
            ExpensesByCategoryChartConfig.getBorderColor(),
            ExpensesByCategoryChartConfig.getBorderWidth(),
            ExpensesByCategoryChartConfig.getBorderRadius()
        );

        return new DashboardExpenseByCategoryDTO(
            labels,
            [expensesByCategoryDataset]
        );
    }
}