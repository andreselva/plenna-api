import { Body, Controller, Delete, Dependencies, Get, Headers, Param, Post, Put, Query } from "@nestjs/common";
import RevenuesService from "./RevenuesService";
import { RevenueDTO } from "./DTOs/RevenueDTO";
import PeriodoDTO from "src/DTOs/PeriodoDTO";

@Controller('/revenues')
@Dependencies(RevenuesService)
export default class RevenuesController {
    constructor(
        private readonly revenuesService: RevenuesService
    ) { }

    @Get()
    async getRevenues(@Headers('x-periodo') periodo: string) {
        const newPeriodo = JSON.parse(periodo) as PeriodoDTO;
        return await this.revenuesService.getRevenues(newPeriodo);
    }

    @Post()
    async createRevenue(@Body() revenue: RevenueDTO, @Headers('x-periodo') periodo: string) {
        const newPeriodo = JSON.parse(periodo) as PeriodoDTO;
        return await this.revenuesService.createRevenue(revenue, newPeriodo);
    }

    @Delete(':id')
    async DeleteRevenue(
        @Param('id') id: string,
        @Query('deleteInstallments') deleteInstallments: string = 'false',
        @Query('sourceAccountId') sourceAccountId: string = '0',
        @Headers('x-periodo') periodo: string
    ) {
        const newPeriodo = JSON.parse(periodo) as PeriodoDTO;
        return await this.revenuesService.deleteRevenue(id, deleteInstallments, sourceAccountId, newPeriodo);
    }

    @Put(':id')
    async updateRevenue(
        @Param('id') id: string, 
        @Body() revenue: RevenueDTO,
        @Headers('x-periodo') periodo: string
    ) {
        const newPeriodo = JSON.parse(periodo) as PeriodoDTO;
        return await this.revenuesService.updateRevenue(id, revenue, newPeriodo);
    }
}