import { Module } from "@nestjs/common";
import { RevenueModule } from "./Revenues/revenue.module";
import { InvoicesModule } from "./Invoices/invoices.module";
import { BankAccountModule } from "./BankAccounts/bank.accounts.module";
import { ExpensesModule } from "./Expenses/expenses.module";
import { PaymentModule } from "./Payment/payment.module";

@Module({
    imports: [BankAccountModule, ExpensesModule, InvoicesModule, PaymentModule, RevenueModule],
    controllers: [],
    exports: [InvoicesModule]

})
export class FinanceModule { }
