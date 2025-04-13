import { Body, Controller, Delete, Dependencies, Get, Param, Post, Put } from "@nestjs/common";
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

    @Delete(':id')
    async deleteExpense(@Param('id') id: string) {
        return await this.service.deleteExpense(id);
    }

    @Put(':id')
    async updateExpense(@Param('id') id: string, @Body() expense: ExpenseDTO) {
        return await this.service.updateExpense(id, expense);
    }
}