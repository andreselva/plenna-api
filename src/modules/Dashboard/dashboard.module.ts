import { Module } from "@nestjs/common";
import { DashboardController } from "./DashboardController";
import { DashboardServices } from "./DashboardServices";
import { InvoicesModule } from "src/modules/Finance/Invoices/invoices.module";
import { BillsDueService } from "./BillsDue/BillsDueService";
import { CurrentBalanceService } from "./CurrentBalance/CurrentBalanceService";
import { ExpensesByCategoryService } from "./ExpensesByCategory/ExpensesByCategoryService";
import { MonthlyProgressServices } from "./MonthlyProgress/MonthlyProgressServices";
import CreditCardStatementsService from "./CreditCardStatements/CreditCardStatementsService";
import { BillsDueRepository } from "./BillsDue/BillsDueRepository";
import CreditCardStatementsRepository from "./CreditCardStatements/CreditCardStatementsRepository";
import { CurrentBalanceRepository } from "./CurrentBalance/CurrentBalanceRepository";
import { ExpensesByCategoryRepository } from "./ExpensesByCategory/ExpensesByCategoryRepository";
import { MonthlyProgressRepository } from "./MonthlyProgress/MonthlyProgressRepository";

@Module({
    imports: [InvoicesModule],
    providers: [
        DashboardServices,
        BillsDueService, 
        BillsDueRepository, 
        CreditCardStatementsRepository, 
        CreditCardStatementsService, 
        CurrentBalanceRepository, 
        CurrentBalanceService,
        ExpensesByCategoryRepository,
        ExpensesByCategoryService, 
        MonthlyProgressRepository,
        MonthlyProgressServices
    ],
    controllers: [DashboardController],
    exports: [DashboardServices]
})

export class DashboardModule { }
