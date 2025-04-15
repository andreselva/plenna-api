import { Injectable } from "@nestjs/common";
import { DashboardCurrentBalanceDTO } from "../DTOs/DashboardDTO";
import { CurrentBalanceRepository } from "./CurrentBalanceRepository";
import { DashboardCurrentBalanceDatasetDTO } from "./DTOs/DashboardCurrentBalanceDatasetDTO";

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
            ["rgba(76, 175, 80, 0.8)", "rgba(244, 67, 54, 0.8)"],
            ["rgba(76, 175, 80, 1)", "rgba(244, 67, 54, 1)"],
            0,
            4
        );

        return new DashboardCurrentBalanceDTO(
            ['Receitas', 'Despesas'],
            [currentBalanceDataSet]
        );
    }

    private async getTotalRevenues(): Promise<number> {
        return await this.repository.getSumAllRevenues();
    }

    private async getTotalExpenses(): Promise<number> {
        return await this.repository.getSumAllExpenses();
    }
}