import { Injectable } from "@nestjs/common";
import { BillsDueService } from "./BillsDue/BillsDueService";
import { CurrentBalanceService } from "./CurrentBalance/CurrentBalanceService";
import { ExpensesByCategoryService } from "./ExpensesByCategory/ExpensesByCategoryService";
import { MonthlyProgressServices } from "./MonthlyProgress/MonthlyProgressServices";
import CreditCardStatementsService from "./CreditCardStatements/CreditCardStatementsService";
import DashboardArgs from "./Args/DashboardArgs";

@Injectable()
export class DashboardServices {
    constructor(
        private readonly currentBalance: CurrentBalanceService,
        private readonly expensesByCategory: ExpensesByCategoryService,
        private readonly billsDue: BillsDueService,
        private readonly monthlyProgress: MonthlyProgressServices,
        private readonly creditCardStatements: CreditCardStatementsService,
    ) { }

    async getDashboardData(args: DashboardArgs) {
        const currentBalance = await this.currentBalance.getCurrentBalanceData(args);
        const expensesByCategory = await this.expensesByCategory.getExpensesByCategoryData(args);
        const billsDue = await this.billsDue.getBillsData(args);
        const monthlyProgress = await this.monthlyProgress.getMonthlyProgressData(args);
        const creditCardStatements = await this.creditCardStatements.getData(args);
        return {
            dashboardData: {
                currentBalance: currentBalance,
                expensesByCategory: expensesByCategory,
                billsDue: billsDue,
                monthlyProgress: monthlyProgress,
                remainingBalance: currentBalance,
                creditCardStatements: creditCardStatements.data,
                highestBillCard: creditCardStatements.highestBillCard
            }
        };
    }
}