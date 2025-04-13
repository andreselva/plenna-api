import { Body, Controller, Dependencies, Get, Post } from "@nestjs/common";
import { ExpensesServices } from "./ExpensesServices";
import { ExpenseDTO } from "./DTOs/ExpenseDTO";

@Controller('/expenses')
@Dependencies(ExpensesServices)
export class ExpensesController {
    constructor(
        private readonly service: ExpensesServices
    ) { }

    @Get()
    async getExpenses() {
        return await this.service.getExpenses();
    }

    @Post()
    async createExpense(@Body() expense: ExpenseDTO) {
        return await this.service.createExpense(expense);
    }
}