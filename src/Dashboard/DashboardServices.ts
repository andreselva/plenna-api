import { Injectable } from "@nestjs/common";
import { BillsDueService } from "./BillsDue/BillsDueService";
import { CurrentBalanceService } from "./CurrentBalance/CurrentBalanceService";
import { ExpensesByCategoryService } from "./ExpensesByCategory/ExpensesByCategoryService";
import { MonthlyProgressServices } from "./MonthlyProgress/MonthlyProgressServices";
import CreditCardStatementsService from "./CreditCardStatements/CreditCardStatementsService";

@Injectable()
export class DashboardServices {
    constructor(
        private readonly currentBalance: CurrentBalanceService,
        private readonly expensesByCategory: ExpensesByCategoryService,
        private readonly billsDue: BillsDueService,
        private readonly monthlyProgress: MonthlyProgressServices,
        private readonly creditCardStatements: CreditCardStatementsService,
    ) { }

    async getDashboardData() {
        const currentBalance = await this.currentBalance.getCurrentBalanceData();
        const expensesByCategory = await this.expensesByCategory.getExpensesByCategoryData();
        const billsDue = await this.billsDue.getBillsData();
        const monthlyProgress = await this.monthlyProgress.getMonthlyProgressData();
        const creditCardStatements = await this.creditCardStatements.getData();
        return {
            currentBalance: currentBalance,
            expensesByCategory: expensesByCategory,
            billsDue: billsDue,
            monthlyProgress: monthlyProgress,
            remainingBalance: currentBalance.remainingBalance,
            creditCardStatements: creditCardStatements
        };
    }
}