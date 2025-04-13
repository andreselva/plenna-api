import { Body, Controller, Dependencies, Get, Post } from "@nestjs/common";
import RevenuesService from "./RevenuesService";
import { RevenueDTO } from "./DTOs/RevenueDTO";

@Controller('/revenues')
@Dependencies(RevenuesService)
export default class RevenuesController {
    constructor(
        private readonly revenuesService: RevenuesService
    ) {}

    @Get()
    async getRevenues() {
        return await this.revenuesService.getRevenues();
    }

    @Post()
    async createRevenue(@Body() revenue: RevenueDTO) {
        return await this.revenuesService.createRevenue(revenue);
    }
}