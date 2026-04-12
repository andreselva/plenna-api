import { Module } from "@nestjs/common";
import { RevenueModule } from "./Revenues/revenue.module";
import { InvoicesModule } from "./Invoices/invoices.module";
import { ExpensesModule } from "./Expenses/expenses.module";
import { PaymentModule } from "./Payment/payment.module";
import { CreditCardsModule } from "./credit-cards/credit-cards.module";
import { BankAccountsModule } from './core/bank-accounts/bank-accounts.module';
import { FinancialEventsModule } from "./core/financial-events/financial-events.module";
import { TransfersModule } from "./transfers/transfers.module";

@Module({
    imports: [
        CreditCardsModule,
        ExpensesModule,
        InvoicesModule,
        PaymentModule,
        RevenueModule,
        BankAccountsModule,
        FinancialEventsModule,
        TransfersModule,
    ],
    controllers: [],
    exports: [InvoicesModule]

})
export class FinanceModule { }
