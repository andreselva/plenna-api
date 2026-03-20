import { Module } from "@nestjs/common";
import { RevenueModule } from "./Revenues/revenue.module";
import { InvoicesModule } from "./Invoices/invoices.module";
import { ExpensesModule } from "./Expenses/expenses.module";
import { PaymentModule } from "./Payment/payment.module";
import { CreditCardsModule } from "./credit-cards/credit-cards.module";
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';

@Module({
    imports: [CreditCardsModule, ExpensesModule, InvoicesModule, PaymentModule, RevenueModule, BankAccountsModule],
    controllers: [],
    exports: [InvoicesModule]

})
export class FinanceModule { }
