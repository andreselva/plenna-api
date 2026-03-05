import { forwardRef, Module } from "@nestjs/common";
import PaymentController from "./payment.controller";
import PaymentService from "./payment.service";
import { PaymentRepository } from "./payment.repository";
import { InvoicesModule } from "../Invoices/invoices.module";
import { ExpensesModule } from "../Expenses/expenses.module";
import { RevenueModule } from "../Revenues/revenue.module";
import { FinancialEventsModule } from "src/modules/financial-events/financial-events.module";

@Module({
    imports: [forwardRef(() => InvoicesModule), ExpensesModule, RevenueModule, FinancialEventsModule],
    providers: [PaymentService, PaymentRepository],
    controllers: [PaymentController],
    exports: []

})
export class PaymentModule { }
