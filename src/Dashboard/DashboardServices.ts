import { Dependencies, Injectable } from "@nestjs/common";
import { BillsDueService } from "./BillsDue/BillsDueService";
import { CurrentBalanceService } from "./CurrentBalance/CurrentBalanceService";
import { ExpensesByCategoryService } from "./ExpensesByCategory/ExpensesByCategoryService";

@Injectable()
@Dependencies(CurrentBalanceService, ExpensesByCategoryService, BillsDueService)
export class DashboardServices {
    constructor(
        private readonly currentBalance: CurrentBalanceService,
        private readonly expensesByCategory: ExpensesByCategoryService,
        private readonly billsDue: BillsDueService
    ) { }

    async getDashboardData() {
        const currentBalance = await this.currentBalance.getCurrentBalanceData();
        const expensesByCategory = await this.expensesByCategory.getExpensesByCategoryData();
        const billsDue = await this.billsDue.getBillsData();
        return {
            saldoAtual: currentBalance,
            despesasPorCategoria: expensesByCategory,
            contasVencendo: billsDue,
        };
    }
}