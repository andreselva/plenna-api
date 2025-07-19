import { forwardRef, Module } from "@nestjs/common";
import PaymentController from "./payment.controller";
import PaymentService from "./payment.service";
import PaymentRegister from "./UseCases/PaymentRegister";
import PaymentRepository from "./payment.repository";
import MySQLDatabase from "src/Config/Database/MySQLDatabase";
import { InvoicesModule } from "../invoices.module";

@Module({
    imports: [forwardRef(() => InvoicesModule)],
    providers: [PaymentService, PaymentRegister, PaymentRepository, MySQLDatabase],
    controllers: [PaymentController],
    exports: []

})
export class PaymentModule { }
