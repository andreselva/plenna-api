import { Injectable } from "@nestjs/common";
import { CurrentBalanceRepository } from "./CurrentBalanceRepository";
import { DashboardCurrentBalanceDatasetDTO } from "./DTOs/DashboardCurrentBalanceDatasetDTO";
import { CurrentBalanceChartConfig } from "./ChartConfig/CurrentBalanceChartConfig";
import { DashboardCurrentBalanceDTO } from "./DTOs/DashboardCurrentBalanceDTO";

@Injectable()
export class CurrentBalanceService {
    constructor(
        private readonly repository: CurrentBalanceRepository
    ) { }

    async getCurrentBalanceData() {
        const totalRevenues = await this.getTotalRevenues();
        const totalExpenses = await this.getTotalExpenses();

        const currentBalanceDataSet = new DashboardCurrentBalanceDatasetDTO(
            [totalRevenues, totalExpenses],
            CurrentBalanceChartConfig.getBackgroundColors(),
            CurrentBalanceChartConfig.getHoverBackgroundColors(),
            CurrentBalanceChartConfig.getBorderWidth(),
            CurrentBalanceChartConfig.getHoverOffset()
        );

        return new DashboardCurrentBalanceDTO(
            CurrentBalanceChartConfig.getLabels(),
            [currentBalanceDataSet],
        );
    }

    private async getTotalRevenues(): Promise<number> {
        return await this.repository.getSumAllRevenues();
    }

    private async getTotalExpenses(): Promise<number> {
        return await this.repository.getSumAllExpenses();
    }
}