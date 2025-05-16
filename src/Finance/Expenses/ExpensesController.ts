import { Body, Controller, Delete, Dependencies, Get, HttpStatus, Param, Post, Put, Query } from "@nestjs/common";
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
    async deleteExpense(
        @Param('id') id: string,
        @Query('deleteInstallments') deleteInstallments: string = 'false',
        @Query('sourceAccountId') sourceAccountId: string = '0'
    ) {
        console.log("Recebendo requisição para apagar despesa.");
        if (Number(id) <= 0) {
            return {
                message: "Invalid ID!",
                statusCode: HttpStatus.BAD_REQUEST
            }
        }
        return await this.service.deleteExpense(id, deleteInstallments, sourceAccountId);
    }

    @Put(':id')
    async updateExpense(@Param('id') id: string, @Body() expense: ExpenseDTO) {
        return await this.service.updateExpense(id, expense);
    }
}