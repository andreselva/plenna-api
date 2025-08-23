import { Injectable } from "@nestjs/common";
import { CurrentBalanceRepository } from "./CurrentBalanceRepository";
import DashboardArgs from "../Args/DashboardArgs";

@Injectable()
export class CurrentBalanceService {
    constructor(
        private readonly repository: CurrentBalanceRepository
    ) { }

    async getCurrentBalanceData(args: DashboardArgs) {
        const totalRevenues = await this.repository.getSumAllRevenues(args);
        const totalExpenses = await this.repository.getSumAllExpenses(args);

        return {
            revenues: totalRevenues,
            expenses: totalExpenses
        }
    }
}