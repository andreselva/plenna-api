import { Dependencies, Injectable } from "@nestjs/common";
import { BillsDueService } from "./BillsDue/BillsDueService";
import { CurrentBalanceService } from "./CurrentBalance/CurrentBalanceService";
import { ExpensesByCategoryService } from "./ExpensesByCategory/ExpensesByCategoryService";
import { MonthlyProgressServices } from "./MonthlyProgress/MonthlyProgressServices";

@Injectable()
@Dependencies(CurrentBalanceService, ExpensesByCategoryService, BillsDueService, MonthlyProgressServices)
export class DashboardServices {
    constructor(
        private readonly currentBalance: CurrentBalanceService,
        private readonly expensesByCategory: ExpensesByCategoryService,
        private readonly billsDue: BillsDueService,
        private readonly monthlyProgress: MonthlyProgressServices
    ) { }

    async getDashboardData() {
        const currentBalance = await this.currentBalance.getCurrentBalanceData();
        const expensesByCategory = await this.expensesByCategory.getExpensesByCategoryData();
        const billsDue = await this.billsDue.getBillsData();
        const monthlyProgress = await this.monthlyProgress.getMonthlyProgressData();        
        return {
            saldoAtual: currentBalance,
            despesasPorCategoria: expensesByCategory,
            contasVencendo: billsDue,
            evolucaoMensal: monthlyProgress
        };
    }
}