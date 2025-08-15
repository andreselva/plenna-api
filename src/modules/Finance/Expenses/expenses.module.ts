import { forwardRef, Module } from "@nestjs/common";
import { ExpensesServices } from "./ExpensesServices";
import { ExpensesRepository } from "./ExpensesRepository";
import { CreateExpense } from "./UseCases/CreateExpense";
import { DeleteExpense } from "./UseCases/DeleteExpense";
import { GetExpenses } from "./UseCases/GetExpenses";
import { UpdateExpense } from "./UseCases/UpdateExpense";
import { ExpensesController } from "./ExpensesController";
import { InvoicesModule } from "../Invoices/invoices.module";

@Module({
    imports: [forwardRef(() => InvoicesModule)],
    providers: [ExpensesServices, ExpensesRepository, CreateExpense, DeleteExpense, GetExpenses, UpdateExpense],
    controllers: [ExpensesController],
    exports: [ExpensesServices]
})

export class ExpensesModule { }
