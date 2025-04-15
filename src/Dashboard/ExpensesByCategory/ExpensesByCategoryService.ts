import { Injectable } from "@nestjs/common";
import { DashboardExpenseByCategoryDatasetDTO } from "./DTOs/DashboardExpenseByCategoryDatasetDTO";
import { DashboardExpenseByCategoryDTO } from "./DTOs/DashboardExpenseByCategoryDTO";
import { ExpensesByCategoryRepository } from "./ExpensesByCategoryRepository";

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
            [
                'rgba(255, 99, 132, 0.7)',
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 205, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(153, 102, 255, 0.7)',
            ],
            [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                'rgb(153, 102, 255)',
            ],
            1,
            5
        );

        return new DashboardExpenseByCategoryDTO(
            labels,
            [expensesByCategoryDataset]
        );
    }
}