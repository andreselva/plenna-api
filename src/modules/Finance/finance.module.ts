import { Module } from "@nestjs/common";
import { RevenueModule } from "./Revenues/revenue.module";
import { InvoicesModule } from "./Invoices/invoices.module";
import { ExpensesModule } from "./Expenses/expenses.module";
import { PaymentModule } from "./Payment/payment.module";
import { CreditCardsModule } from "./credit-cards/credit-cards.module";

@Module({
    imports: [CreditCardsModule, ExpensesModule, InvoicesModule, PaymentModule, RevenueModule],
    controllers: [],
    exports: [InvoicesModule]

})
export class FinanceModule { }
