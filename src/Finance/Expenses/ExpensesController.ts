import { Body, Controller, Delete, Dependencies, Get, Headers, HttpStatus, Param, Post, Put, Query } from "@nestjs/common";
import { ExpensesServices } from "./ExpensesServices";
import { ExpenseDTO } from "./DTOs/ExpenseDTO";
import PeriodoDTO from "src/DTOs/PeriodoDTO";

@Controller('/expenses')
@Dependencies(ExpensesServices)
export class ExpensesController {
    constructor(
        private readonly service: ExpensesServices
    ) { }

    @Get()
    async getExpenses(@Headers('x-periodo') periodo: string) {
        const newPeriodo = JSON.parse(periodo) as PeriodoDTO;
        return await this.service.getExpenses(newPeriodo);
    }

    @Post()
    async createExpense(
        @Body() expense: ExpenseDTO,
        @Headers('x-periodo') periodo: string
    ) {
        console.log(expense);
        const newPeriodo = JSON.parse(periodo) as PeriodoDTO;
        return await this.service.createExpense(expense, newPeriodo);
    }

    @Delete(':id')
    async deleteExpense(
        @Param('id') id: string,
        @Query('deleteInstallments') deleteInstallments: string = 'false',
        @Query('sourceAccountId') sourceAccountId: string = '0',
        @Headers('x-periodo') periodo: string
    ) {
        if (Number(id) <= 0) {
            return {
                message: "Invalid ID!",
                statusCode: HttpStatus.BAD_REQUEST
            }
        }
        const newPeriodo = JSON.parse(periodo) as PeriodoDTO;
        return await this.service.deleteExpense(id, deleteInstallments, sourceAccountId, newPeriodo);
    }

    @Put(':id')
    async updateExpense(
        @Param('id') id: string,
        @Body() expense: ExpenseDTO,
        @Headers('x-periodo') periodo: string
    ) {
        console.log(expense);
        const newPeriodo = JSON.parse(periodo) as PeriodoDTO;
        return await this.service.updateExpense(id, expense, newPeriodo);
    }
}