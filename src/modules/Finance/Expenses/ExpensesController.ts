import { Body, Controller, Delete, Dependencies, Get, Headers, HttpCode, HttpStatus, Param, Post, Put, Query } from "@nestjs/common";
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
    @HttpCode(HttpStatus.OK)
    async getExpenses(@Headers('x-periodo') periodo: string) {
        const newPeriodo = JSON.parse(periodo) as PeriodoDTO;
        return await this.service.getExpenses(newPeriodo);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createExpense(@Body() expense: ExpenseDTO, @Headers('x-periodo') periodo: string) {
        const newPeriodo = JSON.parse(periodo) as PeriodoDTO;
        return await this.service.createExpense(expense, newPeriodo);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteExpense(
        @Param('id') id: string,
        @Query('deleteInstallments') deleteInstallments: string = 'false',
        @Query('sourceAccountId') sourceAccountId: string = '0',
        @Headers('x-periodo') periodo: string
    ) {
        if (Number(id) <= 0) {
            throw new Error(`Invalid ID`);
        }
        const newPeriodo = JSON.parse(periodo) as PeriodoDTO;
        return await this.service.deleteExpense(id, deleteInstallments, sourceAccountId, newPeriodo);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async updateExpense(
        @Param('id') id: string,
        @Body() expense: ExpenseDTO,
        @Headers('x-periodo') periodo: string
    ) {
        const newPeriodo = JSON.parse(periodo) as PeriodoDTO;
        return await this.service.updateExpense(id, expense, newPeriodo);
    }
}