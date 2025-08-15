import { Injectable } from "@nestjs/common";
import { DashboardExpenseByCategoryDatasetDTO } from "./DTOs/DashboardExpenseByCategoryDatasetDTO";
import { DashboardExpenseByCategoryDTO } from "./DTOs/DashboardExpenseByCategoryDTO";
import { ExpensesByCategoryRepository } from "./ExpensesByCategoryRepository";
import ExpensesByCategoryChartConfig from "./ChartConfig/ExpensesByCategoryChartConfig";
import DashboardArgs from "../Args/DashboardArgs";

@Injectable()
export class ExpensesByCategoryService {
    constructor(
        private readonly repository: ExpensesByCategoryRepository
    ) { }

    async getExpensesByCategoryData(args: DashboardArgs) {
        const expenses = await this.repository.getTotalExpenses(args);

        const labels: string[] = [];
        const totals: number[] = [];

        expenses.forEach(expense => {
            labels.push(expense.name);
            totals.push(expense.value);
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