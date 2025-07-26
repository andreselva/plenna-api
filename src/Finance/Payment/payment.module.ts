import { forwardRef, Module } from "@nestjs/common";
import PaymentController from "./payment.controller";
import PaymentService from "./payment.service";
import PaymentRegister from "./UseCases/PaymentRegister";
import { PaymentRepository } from "./payment.repository";
import { InvoicesModule } from "../Invoices/invoices.module";
import { ExpensesModule } from "../Expenses/expenses.module";
import GetPayments from "./UseCases/GetPayments";
import DeletePayment from "./UseCases/DeletePayment";

@Module({
    imports: [forwardRef(() => InvoicesModule), ExpensesModule],
    providers: [PaymentService, PaymentRegister, PaymentRepository, GetPayments, DeletePayment],
    controllers: [PaymentController],
    exports: []

})
export class PaymentModule { }
