import { forwardRef, Module } from "@nestjs/common";
import PaymentController from "./payment.controller";
import PaymentService from "./payment.service";
import PaymentRegister from "./UseCases/PaymentRegister";
import { PaymentRepository } from "./payment.repository";
import { InvoicesModule } from "../Invoices/invoices.module";
import { ExpensesModule } from "../Expenses/expenses.module";

@Module({
    imports: [forwardRef(() => InvoicesModule), ExpensesModule],
    providers: [PaymentService, PaymentRegister, PaymentRepository],
    controllers: [PaymentController],
    exports: []

})
export class PaymentModule { }
