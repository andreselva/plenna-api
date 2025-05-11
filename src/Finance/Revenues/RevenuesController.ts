import { Body, Controller, Delete, Dependencies, Get, Param, Post, Put, Query } from "@nestjs/common";
import RevenuesService from "./RevenuesService";
import { RevenueDTO } from "./DTOs/RevenueDTO";

@Controller('/revenues')
@Dependencies(RevenuesService)
export default class RevenuesController {
    constructor(
        private readonly revenuesService: RevenuesService
    ) { }

    @Get()
    async getRevenues() {
        return await this.revenuesService.getRevenues();
    }

    @Post()
    async createRevenue(@Body() revenue: RevenueDTO) {
        return await this.revenuesService.createRevenue(revenue);
    }

    @Delete(':id')
    async DeleteRevenue(
        @Param('id') id: string,
        @Query('deleteInstallments') deleteInstallments: string = 'false',
        @Query('sourceAccountId') sourceAccountId: string = '0'
    ) {
        return await this.revenuesService.deleteRevenue(id, deleteInstallments, sourceAccountId);
    }

    @Put(':id')
    async updateRevenue(@Param('id') id: string, @Body() revenue: RevenueDTO) {
        return await this.revenuesService.updateRevenue(id, revenue);
    }
}