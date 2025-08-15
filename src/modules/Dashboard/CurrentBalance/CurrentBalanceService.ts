import { Injectable } from "@nestjs/common";
import { CurrentBalanceRepository } from "./CurrentBalanceRepository";
import { DashboardCurrentBalanceDatasetDTO } from "./DTOs/DashboardCurrentBalanceDatasetDTO";
import { CurrentBalanceChartConfig } from "./ChartConfig/CurrentBalanceChartConfig";
import { DashboardCurrentBalanceDTO } from "./DTOs/DashboardCurrentBalanceDTO";
import DashboardArgs from "../Args/DashboardArgs";

@Injectable()
export class CurrentBalanceService {
    constructor(
        private readonly repository: CurrentBalanceRepository
    ) { }

    async getCurrentBalanceData(args: DashboardArgs) {
        const totalRevenues = await this.repository.getSumAllRevenues(args);
        const totalExpenses = await this.repository.getSumAllExpenses(args);

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
            totalRevenues - totalExpenses
        );
    }
}